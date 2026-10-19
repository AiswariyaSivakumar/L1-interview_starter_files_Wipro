import {data} from "../data/MOCK_DATA";

export async function getDeployments() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return data;
}