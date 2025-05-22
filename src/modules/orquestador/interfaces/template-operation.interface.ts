import { TipoDato } from './../../../common/enums/tipo-dato.enum';
import { TipoOperacion } from './../../../common/enums/tipo-operacion.enum';

interface TemplateOperationDto {
  type: TipoOperacion;
  entityDefinition: {
    name: string;
    tableName: string;
    description?: string;
    connectionId: string;
    fields: Array<{
      name: string;
      columnName: string;
      type: TipoDato;
      isPrimary?: boolean;
      isRequired?: boolean;
      isSearchable?: boolean;
      isVisible?: boolean;
      isEditable?: boolean;
      validationRules?: Array<{
        type: string;
        value: any;
        message?: string;
      }>;
      isAutoIncremental?: boolean;
      sequency?: string;
    }>;
  };
  filters?: any;
  data?: any;
  id?: any;
  pagination?: {
    page?: number;
    limit?: number;
  };
  sorting?: Array<{
    field: string;
    direction: 'ASC' | 'DESC';
  }>;
}
