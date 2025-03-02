export interface TransferDataNode {
    type: "unknown" | "uc" | "uc-link" | "tpt" | "tpt-link" | "text" | "json" | "link",
    unqKey?: string,
    data?: any,
};
export const transferDataNode: TransferDataNode = {
    type: "unknown",
    unqKey: '',
    data: undefined,
}