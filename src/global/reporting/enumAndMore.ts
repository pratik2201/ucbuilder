export type unitType = 'pt' | 'cm' | 'mm' | 'pc' | 'in';
export interface PageInfo{
  width: number,
  height: number,
  unit: unitType,
}

export const pageInfo:PageInfo = {
  width: 210,
  height: 297,
  unit: 'mm' ,
};