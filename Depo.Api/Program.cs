using System;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace Depo.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                CreateWebHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .ConfigureLogging((context, builder) =>
                {
                    builder.ClearProviders();

                })
                .UseKestrel(options =>
                {
                    options.Limits.MaxRequestBodySize = 2147483647;
                    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(15);
                })
                .UseStartup<Startup>();
    }
}
