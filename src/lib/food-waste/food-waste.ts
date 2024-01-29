export interface FoodWaste2021Data {
  country: string;
  FoodWaste2021kgcapitayear: number;
  FoodWaste2021tonsyear: number;
}

export async function getAllData(): Promise<FoodWaste2021Data[]> {
  const response = await fetch("/food-waste-by-country-2024.json");
  return await response.json();
}

export class FoodWaste2021Service {
  private data: Record<string, FoodWaste2021Data> = {};

  public async setup() {
    this.data = {};
    const data = await getAllData();
    data.forEach((item) => {
      this.data[item.country] = item;
    });
  }

  public getDataByCountry(countryName: string): FoodWaste2021Data | undefined {
    return this.data[countryName];
  }
}

export async function createFoodWasteService(): Promise<FoodWaste2021Service> {
  const service = new FoodWaste2021Service();
  await service.setup();
  return service;
}
