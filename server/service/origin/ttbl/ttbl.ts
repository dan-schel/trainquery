import { CompletePattern } from "../../../../shared/system/service/complete-pattern";
import { Service } from "../../../../shared/system/service/service";
import { ServiceOrigin } from "../origin";

export class TtblServiceOrigin extends ServiceOrigin<CompletePattern> {
  async getService(): Promise<Service<CompletePattern> | null> {
    // TODO: Implement this.
    return null;
  }

  async getDepartures(): Promise<Service<CompletePattern>[]> {
    // TODO: Implement this.
    return [];
  }
}
