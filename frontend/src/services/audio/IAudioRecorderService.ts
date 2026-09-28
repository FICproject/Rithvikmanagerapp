/**
 * Audio Recorder Service Interface for Exception Reports & Field Visits
 */

export interface AudioRecordingResult {
  filePath: string;
  durationSeconds: number;
  mimeType: string;
  source?: 'RECORDED' | 'UPLOADED';
  fileName?: string;
}

export type PermissionStatus = 'GRANTED' | 'DENIED' | 'NEVER_ASK_AGAIN';

export interface IAudioRecorderService {
  requestMicrophonePermission(): Promise<PermissionStatus>;
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioRecordingResult>;
  cancelRecording(): Promise<void>;
  releaseMicrophone(): Promise<void>;
  isRecording(): boolean;
}

