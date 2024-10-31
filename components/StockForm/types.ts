export interface Attribute {
    id: string;
    attributeName: string;
    value: string;
}

export interface SelectedProperty {
    propertyName: string;
    selectedValues: string[];
}

export interface GroupedAttribute {
    name: string;
    values: Array<{
        id: string;
        value: string;
    }>;
}