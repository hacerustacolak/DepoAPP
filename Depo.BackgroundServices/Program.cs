using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;
using Microsoft.Extensions.DependencyInjection;
using Depo.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace Depo.BackgroundServices
{
    public class Program
    {
        static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    IConfiguration configuration = hostContext.Configuration;

                    //var appSettingsSection = configuration.GetSection("AppSettings");
                    //var appSettings = appSettingsSection.Get<Models.AppSettings>();
                    //services.AddSingleton(appSettings);

                    //var minioSection = configuration.GetSection("MinioConfig");
                    //var minioSettings = minioSection.Get<MinioSettings>();
                    //services.AddSingleton(minioSettings);


                    //services.AddDbContext<DepoDbContext>(options =>
                    //{
                    //    options.UseMySql(connStr,
                    //        mysqlOptions =>
                    //        {
                    //            mysqlOptions.MigrationsAssembly("Depo.Data.Models");
                    //            mysqlOptions.EnableRetryOnFailure(
                    //                        maxRetryCount: 10,
                    //                        maxRetryDelay: TimeSpan.FromSeconds(30),
                    //                        errorNumbersToAdd: null
                    //                    );
                    //        });
                    //}, ServiceLifetime.Transient);


                });
    }
}
