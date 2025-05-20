import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAtributosTablaDto } from '../../dto/create-atributos-tabla.dto';
import { AtributoTabla } from '../../schemas/atributos-tabla.schema';
import { Modulo, ModuloDocument } from 'src/modules/modulo/schemas/modulo.schema';
import { Model, SortOrder, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateAtributosTablaDto } from '../../dto/update-atributos-tabla.dto';
import { FiltroAtributosTablaDto } from '../../dto/filtro-atributos-tabla.dto';

@Injectable()
export class AtributosTablaService {
  constructor(@InjectModel(Modulo.name) private moduloModel: Model<ModuloDocument>) {}
  /**
   * Obtiene todos los atributos de tabla de una entidad
   * @param idEntidad ID de la entidad
   * @param filtros Filtros para la búsqueda
   * @param pagina Página actual
   * @param size Tamaño de la página
   * @param sorting Ordenamiento
   * @returns Lista de atributos de tabla
   */
  async findAll(
    idEntidad: string,
    filtros?: FiltroAtributosTablaDto,
    pagina: number = 1,
    size: number = 10,
    sorting?: Record<string, 'ASC' | 'DESC'>,
  ) {
    // Verificamos que el módulo exista
    const modulo = await this.moduloModel.findOne({
      activo: true,
      'entidades.activo': true,
      'entidades._id': new Types.ObjectId(idEntidad),
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    const indexEntidad = modulo.entidades.findIndex(
      (entidad) => entidad?._id?.toString() === idEntidad,
    );

    // Buscamos la entidad dentro del módulo
    if (indexEntidad === -1) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    const atributosTabla = modulo.entidades[indexEntidad].atributosTabla;

    // Aplicamos los filtros a los atributos de tabla
    let atributosFiltrados = [...atributosTabla];

    if (filtros) {
      atributosFiltrados = this.aplicarFiltros(atributosFiltrados, filtros);
    }

    // Obtenemos el total antes de aplicar paginación
    const total = atributosFiltrados.length;

    // Aplicamos ordenamiento
    const sort = this.createSort(sorting);
    atributosFiltrados = this.ordenarAtributos(atributosFiltrados, sort);

    // Aplicamos paginación
    const skip = (pagina - 1) * size;
    atributosFiltrados = atributosFiltrados.slice(skip, skip + size);

    return {
      response: atributosFiltrados,
      paginacion: {
        total,
        pagina,
        size,
        paginas: Math.ceil(total / size),
      },
    };
  }

  /**
   * Crea un nuevo atributo de tabla dentro de una entidad
   * @param idEntidad ID de la entidad
   * @param createDto DTO con los datos del atributo de tabla
   * @returns El atributo de tabla creado
   */
  async create(idEntidad: string, createDto: CreateAtributosTablaDto) {
    // Verificamos que el módulo exista
    const modulo = await this.moduloModel.findOne({
      'entidades._id': new Types.ObjectId(idEntidad),
      'entidades.activo': true,
      activo: true,
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    const indexEntidad = modulo.entidades.findIndex(
      (entidad) => entidad?._id?.toString() === idEntidad,
    );

    // Buscamos la entidad dentro del módulo
    if (indexEntidad === -1) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    const atributosTabla = modulo.entidades[indexEntidad].atributosTabla;

    if (atributosTabla && atributosTabla.length > 0) {
      // Verificamos que el nombre y nombreColumna no estén duplicados
      const atributoExistente = atributosTabla.find(
        (atributo) => atributo.nombre === createDto.nombre,
      );
      if (atributoExistente) {
        throw new BadRequestException('Ya existe un atributo con el mismo nombre o nombreColumna');
      }
    }

    const nuevoAtributo: AtributoTabla = {
      ...createDto,
      esPrimario: createDto.esPrimario || false,
      esRequerido: createDto.esRequerido || false,
      esBuscable: createDto.esBuscable || false,
      esVisible: createDto.esVisible || false,
      esEditable: createDto.esEditable || false,
      fechaCreacion: new Date(),
      usuarioCreacion: createDto.usuarioCreacion,
      secuencia: createDto.secuencia || '',
      activo: createDto.activo || true,
      _id: createDto._id ? new Types.ObjectId(createDto._id) : undefined,
    };

    modulo.entidades[indexEntidad].atributosTabla.push(nuevoAtributo);

    // Guardamos el módulo actualizado
    try {
      const result = await modulo.save();
      // Obtenemos el atributo recién guardado (último del array)
      const savedAtributo =
        result.entidades[indexEntidad].atributosTabla[
          result.entidades[indexEntidad].atributosTabla.length - 1
        ];

      return { response: savedAtributo };
    } catch {
      throw new Error(`Error al crear el atributo`);
    }
  }

  /**
   * Actualiza un atributo de tabla dentro de una entidad
   * @param idEntidad ID de la entidad
   * @param idAtributo ID del atributo a actualizar
   * @param updateDto DTO con los datos a actualizar
   * @returns El atributo de tabla actualizado
   */
  async update(idEntidad: string, idAtributo: string, updateDto: UpdateAtributosTablaDto) {
    // Verificamos que el módulo exista
    const modulo = await this.moduloModel.findOne({
      'entidades._id': new Types.ObjectId(idEntidad),
      'entidades.activo': true,
      activo: true,
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    const indexEntidad = modulo.entidades.findIndex(
      (entidad) => entidad?._id?.toString() === idEntidad,
    );

    // Buscamos la entidad dentro del módulo
    if (indexEntidad === -1) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    const atributosTabla = modulo.entidades[indexEntidad].atributosTabla;

    // Buscamos el atributo a actualizar
    const indexAtributo = atributosTabla.findIndex(
      (atributo) => atributo._id?.toString() === idAtributo,
    );

    if (indexAtributo === -1) {
      return { response: null, mensaje: 'Atributo no encontrado' };
    }

    // Actualizamos el atributo
    atributosTabla[indexAtributo] = {
      ...atributosTabla[indexAtributo],
      ...updateDto,
      fechaActualizacion: new Date(),
      usuarioActualizacion: updateDto.usuarioActualizacion,
      _id: new Types.ObjectId(idAtributo),
    };

    // Guardamos el módulo actualizado
    try {
      const result = await modulo.save();
      const updatedAtributo = result.entidades[indexEntidad].atributosTabla[indexAtributo];
      return { response: updatedAtributo };
    } catch {
      throw new Error(`Error al actualizar el atributo`);
    }
  }

  /**
   * Elimina un atributo de tabla dentro de una entidad
   * @param idEntidad ID de la entidad
   * @param idAtributo ID del atributo a eliminar
   * @returns El atributo de tabla eliminado
   */
  async remove(idEntidad: string, idAtributo: string) {
    // Verificamos que el módulo exista
    const modulo = await this.moduloModel.findOne({
      'entidades._id': new Types.ObjectId(idEntidad),
      'entidades.activo': true,
      activo: true,
    });

    if (!modulo) {
      return { response: null, mensaje: 'Modulo no encontrado' };
    }

    const indexEntidad = modulo.entidades.findIndex(
      (entidad) => entidad?._id?.toString() === idEntidad,
    );

    // Buscamos la entidad dentro del módulo
    if (indexEntidad === -1) {
      return { response: null, mensaje: 'Entidad no encontrada' };
    }

    const atributosTabla = modulo.entidades[indexEntidad].atributosTabla;

    // Buscamos el atributo a eliminar
    const indexAtributo = atributosTabla.findIndex(
      (atributo) => atributo._id?.toString() === idAtributo,
    );

    if (indexAtributo === -1) {
      return { response: null, mensaje: 'Atributo no encontrado' };
    }

    // Eliminamos el atributo
    atributosTabla[indexAtributo].activo = false;

    // Guardamos el módulo actualizado
    try {
      await modulo.save();
      return { result: true };
    } catch {
      return { response: null, mensaje: 'Error al eliminar el atributo' };
    }
  }

  /**
   * Aplica filtros a un array de atributos de tabla
   * @param atributos Array de atributos de tabla
   * @param filtros Filtros a aplicar
   * @returns Array de atributos filtrado
   */
  private aplicarFiltros(
    atributos: AtributoTabla[],
    filtros: FiltroAtributosTablaDto,
  ): AtributoTabla[] {
    return atributos.filter((atributo) => {
      // Por defecto, incluir la entidad
      let incluir = true;

      if (filtros._id && incluir) {
        incluir = atributo._id?.toString() === filtros._id;
      }

      if (filtros.nombre && incluir) {
        incluir = atributo.nombre.toLowerCase().includes(filtros.nombre.toLowerCase());
      }

      if (filtros.nombreColumna && incluir) {
        incluir = atributo.nombreColumna
          .toLowerCase()
          .includes(filtros.nombreColumna.toLowerCase());
      }

      if (filtros.tipoDato && incluir) {
        incluir = atributo.tipoDato.toLowerCase().includes(filtros.tipoDato.toLowerCase());
      }

      if (filtros.esPrimario !== undefined && filtros.esPrimario !== null && incluir) {
        incluir = atributo.esPrimario === filtros.esPrimario;
      }

      if (filtros.esRequerido !== undefined && filtros.esRequerido !== null && incluir) {
        incluir = atributo.esRequerido === filtros.esRequerido;
      }

      if (filtros.esBuscable !== undefined && filtros.esBuscable !== null && incluir) {
        incluir = atributo.esBuscable === filtros.esBuscable;
      }

      if (filtros.esVisible !== undefined && filtros.esVisible !== null && incluir) {
        incluir = atributo.esVisible === filtros.esVisible;
      }

      if (filtros.esEditable !== undefined && filtros.esEditable !== null && incluir) {
        incluir = atributo.esEditable === filtros.esEditable;
      }

      if (filtros.secuencia && incluir) {
        incluir =
          atributo.secuencia?.toLowerCase()?.includes(filtros.secuencia.toLowerCase()) ?? false;
      }

      if (filtros.opciones && incluir) {
        incluir = atributo.opciones?.some((opcion) => filtros.opciones?.includes(opcion)) ?? false;
      }

      return incluir;
    });
  }

  /**
   * Ordena un array de atributos de tabla
   * @param atributos Array de atributos de tabla
   * @param sort Objeto de ordenamiento
   * @returns Array de atributos ordenado
   */
  private ordenarAtributos(
    atributosTabla: AtributoTabla[],
    sort: Record<string, SortOrder>,
  ): AtributoTabla[] {
    return [...atributosTabla].sort((a, b) => {
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
