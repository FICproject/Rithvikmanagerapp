/**
 * Interface for Report Export Service
 */
import { Manager, VisitRecord } from '../../types';

export type ExportFormat = 'PDF' | 'CSV' | 'EXCEL';
export type ExportDatePeriod = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';

export interface ExportFilterParams {
  period: ExportDatePeriod;
  format: ExportFormat;
  startDateStr?: string;
  endDateStr?: string;
  manager?: Manager | null;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  fileName: string;
  mimeType: string;
  recordCount: number;
  periodLabel: string;
  blobUrl?: string;
  fileContent?: string;
}

export interface IReportExportService {
  filterRecordsByScopeAndDate(
    records: VisitRecord[],
    params: ExportFilterParams
  ): VisitRecord[];

  generateReportFile(
    records: VisitRecord[],
    params: ExportFilterParams
  ): Promise<ExportResult>;

  openFile(result: ExportResult): Promise<void>;
  shareFile(result: ExportResult): Promise<void>;
}
