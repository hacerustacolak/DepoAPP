using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Depo.Data.Models.Migrations
{
    public partial class customer : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Depo1Id",
                table: "Merchant",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Depo2Id",
                table: "Merchant",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Depo1Id",
                table: "Merchant");

            migrationBuilder.DropColumn(
                name: "Depo2Id",
                table: "Merchant");
        }
    }
}
