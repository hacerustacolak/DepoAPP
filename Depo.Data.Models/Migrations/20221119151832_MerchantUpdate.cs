using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depo.Data.Models.Migrations
{
    public partial class MerchantUpdate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Merchant",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LogoCode",
                table: "Merchant",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "Representive",
                table: "Merchant",
                type: "varchar(255)",
                maxLength: 255,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "City",
                table: "Merchant");

            migrationBuilder.DropColumn(
                name: "LogoCode",
                table: "Merchant");

            migrationBuilder.DropColumn(
                name: "Representive",
                table: "Merchant");
        }
    }
}
