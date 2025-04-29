import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Modulo, ModuloDocument } from '../../schemas/modulo.schema';
import { Model, SortOrder } from 'mongoose';
import { FiltroModuloDto } from '../../dto/filtro-modulo.dto';
import { UpdateModuloDto } from '../../dto/update-modulo.dto';
import { CreateModuloDto } from '../../dto/create-modulo.dto';

@Injectable()
export class ModuloService {
  constructor(@InjectModel(Modulo.name) private moduloModel: Model<ModuloDocument>) {}

  /**
   * Busca todos los módulos según los filtros proporcionados
   * @param filtros Filtros opcionales para la búsqueda
   * @param pagina Número de página
   * @param size Tamaño de página
   * @param sorting Ordenamiento
   * @returns Lista de módulos y total
   */
  async findAll(
    filtros?: FiltroModuloDto,
    pagina: number = 1,
    size: number = 10,
    sorting?: Record<string, 'ASC' | 'DESC'>,
  ) {
    const skip = (pagina - 1) * size;
    const query = this.createQuery(filtros);
    const sort = this.createSort(sorting);

    const [items, total] = await Promise.all([
      this.moduloModel.find(query).sort(sort).skip(skip).limit(size).exec(),
      this.moduloModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      paginacion: {
        total,
        pagina,
        size,
        paginas: Math.ceil(total / size),
      },
    };
  }

  /**
   * Crea un nuevo módulo
   * @param createModuloDto Datos para crear el módulo
   * @returns El módulo creado
   */
  async create(createModuloDto: CreateModuloDto) {
    const createdModulo = new this.moduloModel({
      ...createModuloDto,
      fechaCreacion: new Date(),
    });

    const savedModulo = await createdModulo.save();
    return {
      id: savedModulo._id,
      ...savedModulo.toObject(),
    };
  }

  /**
   * Busca un módulo por su ID
   * @param id ID del módulo
   * @returns El módulo encontrado
   */
  async findOne(id: string) {
    const modulo = await this.moduloModel.findById(id).exec();
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }
    return modulo;
  }

  /**
   * Actualiza un módulo existente
   * @param id ID del módulo
   * @param updateModuloDto Datos para actualizar
   * @returns Resultado de la operación
   */
  async update(id: string, updateModuloDto: UpdateModuloDto) {
    const modulo = await this.moduloModel.findById(id).exec();
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    const updatedModulo = await this.moduloModel
      .findByIdAndUpdate(
        id,
        {
          ...updateModuloDto,
          fechaActualizacion: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedModulo) {
      throw new NotFoundException(`Error al actualizar el módulo con ID ${id}`);
    }

    return {
      id: updatedModulo._id,
      ...updatedModulo.toObject(),
    };
  }

  /**
   * Elimina un módulo por su ID
   * @param id ID del módulo
   * @returns Resultado de la operación
   */
  async remove(id: string) {
    const modulo = await this.moduloModel.findById(id).exec();
    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    await this.moduloModel.findByIdAndDelete(id).exec();
    return {
      success: true,
    };
  }

  /**
   * Crea un objeto de consulta a partir de los filtros
   * @param filtros Filtros proporcionados
   * @returns Objeto de consulta para MongoDB
   */
  private createQuery(filtros?: FiltroModuloDto): Record<string, any> {
    const query: Record<string, any> = {};

    if (!filtros) return query;

    if (filtros.nombre) {
      query.nombre = { $regex: filtros.nombre, $options: 'i' };
    }

    if (filtros.descripcion) {
      query.descripcion = { $regex: filtros.descripcion, $options: 'i' };
    }

    if (filtros.tipoConexion) {
      query.tipoConexion = filtros.tipoConexion;
    }

    if (filtros.database) {
      query.database = { $regex: filtros.database, $options: 'i' };
    }

    if (filtros.apiEndpoint) {
      query.apiEndpoint = { $regex: filtros.apiEndpoint, $options: 'i' };
    }

    if (filtros.activo !== undefined) {
      query.activo = filtros.activo === 'true';
    }

    return query;
  }

  /**
   * Crea un objeto de ordenamiento a partir de los parámetros
   * @param sorting Parámetros de ordenamiento
   * @returns Objeto de ordenamiento para MongoDB
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
