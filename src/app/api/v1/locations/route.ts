import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    //return NextResponse.json({"success":true,"data":[]});
    const provinces = await prisma.province.findMany({
      include: {
        districts: true,
      },
    });
    const resData = {
      "success" : true,
      "data" : {
        provinces: provinces.map(province => ({
          id: province.id,
          title: province.title,
          districts: province.districts.map(district => ({
            id: district.id,
            title: district.title,
          })),
        })),
      }
    };
    return NextResponse.json(resData);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch locations",
      },
      { status: 500 }
    );
  }
}