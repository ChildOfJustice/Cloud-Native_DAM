import {FileMetadata} from "./databaseTables";

export interface FileOverviewType {
    id: number
    file: FileMetadata
    isChecked: boolean
}