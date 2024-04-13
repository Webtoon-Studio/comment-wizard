export interface ISetting {
    iType: "setting";
    key: string;
    desc: string;
    value: boolean;
    toolTip?: string;

}