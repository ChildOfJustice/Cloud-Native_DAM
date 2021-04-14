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
    clusterId?: string
    name?: string
    ownerUserName?: string
    permissions?: string
    // createdDate: string
}

export interface Role {
    role: string
}

export interface Permission {
    clusterId: number
    clusterName?: string
    permissionId?: string
    principalUserName?: string
    permissionGiverUserId?: string
    permissionGiverUserName?: string
    permissions?: string
    clusterOwnerUserName?: string
}