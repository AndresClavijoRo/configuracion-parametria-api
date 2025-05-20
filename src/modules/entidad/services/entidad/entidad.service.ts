import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEntidadDto } from '../../dto/create-entidad.dto';
import { UpdateEntidadDto } from '../../dto/update-entidad.dto';
import { Entidad } from '../../schemas/entidad.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Modulo, ModuloDocument } from 'src/modules/modulo/schemas/modulo.schema';
import { FiltroEntidadDto } from '../../dto/filtro-entidad.dto';
@Injectable()
export class EntidadService {
  constructor(@InjectModel(Modulo.name) private moduloModel: Model<ModuloDocument>) {}

  /**
   * Busca todas las entidades de un módulo según los filtros proporcionados
   * @param idModulo ID del módulo
   * @param filtros Filtros opcionales para la búsqueda
   * @param pagina Número de página
   * @param size Tamaño de página
   * @param sorting Ordenamiento
   * @returns Lista de entidades y total
   */
  async findAll(
    idModulo: string,
    filtros?: FiltroEntidadDto,
    pagina: number = 1,
    size: number = 10,
    sorting?: Record<string, 'ASC' | 'DESC'>,
  ) {
    // Primero verificamos que el módulo exista
    const modulo = await this.moduloModel.findOne(
      { _id: idModulo, activo: true },
      { 'entidades.atributosTabla': 0 },
    );

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    // los filtros a las entidades del módulo
    let entidadesFiltradas = [...modulo.entidades];

    if (filtros) {
      entidadesFiltradas = this.aplicarFiltros(entidadesFiltradas, filtros);
    }

    // Obtenemos el total antes de aplicar paginación
    const total = entidadesFiltradas.length;

    // Aplicamos ordenamiento
    const sort = this.createSort(sorting);
    entidadesFiltradas = this.ordenarEntidades(entidadesFiltradas, sort);

    // Aplicamos paginación
    const skip = (pagina - 1) * size;
    entidadesFiltradas = entidadesFiltradas.slice(skip, skip + size);

    return {
      response: entidadesFiltradas,
      paginacion: {
        total,
        pagina,
        size,
        paginas: Math.ceil(total / size),
      },
    };
  }

  /**
   * Busca una entidad por su ID
   * @param idEntidad ID de la entidad
   * @returns La entidad encontrada
   */
  async findOne(idEntidad: string) {
    // Buscamos la entidad en todos los módulos
    const modulo = await this.moduloModel.findOne({
      'entidades._id': new Types.ObjectId(idEntidad),
      'entidades.activo': true,
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    // Buscamos la entidad dentro del módulo
    const entidad = modulo.entidades.find(
      (entidad) => entidad._id && entidad._id.toString() === idEntidad,
    );

    if (!entidad) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    return { response: entidad };
  }

  /**
   * Crea una nueva entidad dentro de un módulo
   * @param idModulo ID del módulo
   * @param createDto DTO con los datos de la entidad
   * @returns La entidad creada
   */
  async create(idModulo: string, createDto: CreateEntidadDto) {
    // Verificamos que el módulo exista
    const modulo = await this.moduloModel.findById(idModulo);
    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    // Verificamos que el nombre y nombreTabla no estén duplicados
    const entidadExistente = modulo.entidades.find((ent) => ent.nombre === createDto.nombre);
    if (entidadExistente) {
      throw new BadRequestException('Ya existe una entidad con el mismo nombre');
    }

    // Creamos la nueva entidad
    const nuevaEntidad: Entidad = {
      ...createDto,
      descripcion: createDto.descripcion || '',
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      usuarioActualizacion: createDto.usuarioCreacion,
      activo: createDto.activo ?? true,
      atributosTabla: [],
    };

    // Añadimos la entidad al módulo y guardamos
    modulo.entidades.push(nuevaEntidad);

    try {
      const result = await modulo.save();
      // Obtenemos la entidad recién guardada (última del array)
      const savedEntidad = result.entidades[result.entidades.length - 1];

      return { response: savedEntidad };
    } catch {
      throw new Error(`Error al crear la entidad`);
    }
  }

  /**
   * Actualiza una entidad dentro de un módulo
   * @param idModulo ID del módulo que contiene la entidad
   * @param idEntidad ID de la entidad a actualizar
   * @param updateDto DTO con los datos de actualización
   * @returns La entidad actualizada
   */
  async update(idModulo: string, idEntidad: string, updateDto: UpdateEntidadDto) {
    // Primero verificamos que el nuevo nombre no esté duplicado
    const modulo = await this.moduloModel.findOne({
      _id: idModulo,
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    const duplicado = modulo.entidades.some(
      (entidad) => entidad.nombre === updateDto.nombre && entidad._id?.toString() !== idEntidad,
    );

    if (duplicado) {
      throw new BadRequestException('Ya existe una entidad con el mismo nombre en este módulo');
    }

    // Utilizamos findOneAndUpdate para actualizar la entidad en un solo paso
    const resultado = await this.moduloModel.findOneAndUpdate(
      {
        _id: idModulo,
        'entidades._id': new Types.ObjectId(idEntidad),
      },
      {
        $set: {
          'entidades.$.nombre': updateDto.nombre,
          'entidades.$.nombreTabla': updateDto.nombreTabla,
          'entidades.$.descripcion': updateDto.descripcion,
          'entidades.$.activo': updateDto.activo,
          'entidades.$.operaciones': updateDto.operaciones,
          'entidades.$.fechaActualizacion': new Date(),
          'entidades.$.usuarioActualizacion': updateDto.usuarioActualizacion,
        },
      },
      { new: true },
    );

    if (!resultado) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    // Buscamos la entidad actualizada dentro del módulo
    const entidadActualizada = resultado.entidades.find(
      (entidad) => entidad._id && entidad._id.toString() === idEntidad,
    );

    if (!entidadActualizada) {
      return {
        response: null,
        mensaje: `No se pudo encontrar la entidad actualizada con ID ${idEntidad}`,
      };
    }

    return { response: entidadActualizada };
  }

  /**
   * Elimina una entidad de un módulo
   * @param idEntidad ID de la entidad a eliminar
   * @returns Resultado de la operación
   */
  async remove(idEntidad: string) {
    // Buscamos el módulo que contiene la entidad
    const modulo = await this.moduloModel.findOne({
      'entidades._id': new Types.ObjectId(idEntidad),
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    // Actualizamos el campo activo a false para la entidad correspondiente
    const entidadIndex = modulo.entidades.findIndex(
      (entidad) => entidad._id && entidad._id.toString() === idEntidad,
    );

    if (entidadIndex === -1) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    modulo.entidades[entidadIndex].activo = false;

    try {
      await modulo.save();
      return {
        response: true,
      };
    } catch {
      throw new Error(`Error al eliminar la entidad`);
    }
  }

  /**
   * Aplica filtros a un array de entidades
   * @param entidades Array de entidades
   * @param filtros Filtros a aplicar
   * @returns Array de entidades filtrado
   */
  private aplicarFiltros(entidades: Entidad[], filtros: FiltroEntidadDto): Entidad[] {
    return entidades.filter((entidad) => {
      // Siempre incluir solo entidades activas, independientemente del filtro
      let incluir = entidad.activo === true;

      if (filtros.nombre && incluir) {
        incluir = entidad.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      }

      if (filtros.nombreTabla && incluir) {
        incluir = entidad.nombreTabla.toLowerCase().includes(filtros.nombreTabla.toLowerCase());
      }

      if (filtros.descripcion && incluir) {
        incluir = entidad.descripcion?.toLowerCase().includes(filtros.descripcion.toLowerCase());
      }

      if (filtros.operaciones && filtros.operaciones.length > 0 && incluir) {
        incluir = filtros.operaciones.every((op) => entidad.operaciones.includes(op));
      }

      if (filtros._id && incluir) {
        incluir = entidad._id?.toString() === filtros._id;
      }

      return incluir;
    });
  }

  /**
   * Ordena un array de entidades según los criterios proporcionados
   * @param entidades Array de entidades
   * @param sort Criterios de ordenamiento
   * @returns Array de entidades ordenado
   */
  private ordenarEntidades(entidades: Entidad[], sort: Record<string, SortOrder>): Entidad[] {
    return [...entidades].sort((a, b) => {
      // Iteramos por cada campo de ordenamiento
      for (const [field, sortOrder] of Object.entries(sort)) {
        // Verificamos si el campo existe en la entidad
        if (field in a && field in b) {
          // Comparamos los valores
          if (a[field] < b[field]) {
            return sortOrder === 1 ? -1 : 1;
          }
          if (a[field] > b[field]) {
            return sortOrder === 1 ? 1 : -1;
          }
        }
      }
      return 0; // Si son iguales en todos los campos
    });
  }

  /**
   * Crea un objeto de ordenamiento a partir de los parámetros
   * @param sorting Parámetros de ordenamiento
   * @returns Objeto de ordenamiento
   */
  private createSort(sorting?: Record<string, 'ASC' | 'DESC'>) {
    const sort: Record<string, SortOrder> = {};

    if (!sorting) {
      // Ordenamiento por defecto
      return { fechaCreacion: -1 as SortOrder };
    }

    Object.entries(sorting).forEach(([field, direction]) => {
      sort[field] = (direction === 'ASC' ? 1 : -1) as SortOrder;
    });

    return sort;
  }
}
