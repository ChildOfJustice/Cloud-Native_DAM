export interface FileMetadata {
    id?: number
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
    clusterId: number
    clusterName?: string
    permissionId?: string
    principalUserId?: string
    permissionGiverUserId?: string
    permissions?: string
    clusterOwnerUserName?: string
}