import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || "us-east-1",
  // 使用环境变量，不要硬编码凭证！
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function addProduct() {
  const params = {
    TableName: "collaborative",
    Item: marshall({
      PK: "PRODUCT#Product01", // 主键使用 PK
      SK: "PRODUCT#Product01", // 如果有排序键，也需要提供
      id: "Product01",
      description: "Hiking Boots",
      category: "footwear",
      sku: "hiking-sku-01",
      size: 9,
    }),
  };

  try {
    const data = await client.send(new PutItemCommand(params));
    console.log("Success:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

addProduct();
