export interface FileMetadata {
    id: number | null
    name: string
    S3uniqueName: string
    cloud: string
    uploadedBy: string
    ownedBy: string
    sizeOfFile_MB: number
    tagsKeys: string[]
    tagsValues: string[]
}

export interface File_ClusterSub {
    fileId: number
    clusterId: string
    name?: string
}

export interface Cluster {
    clusterId?: number
    name?: string
    ownerUserId?: string
    // createdDate: string
}

export interface Role {
    role: string
}

export interface Permission {
    principalUserId?: string
    clusterId: number
    permissions?: string
    permissionGiverUserId?: string
    permissionId?: string
}