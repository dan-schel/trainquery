import { TrainQuery } from "./trainquery";
import { Banner } from "../../shared/banner";

export class Banners {
  init(ctx: TrainQuery) {}

  getBanners(): Banner[] {
    return [new Banner("Welcome back to Trench")];
  }
}
