using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Depo.Data.Models;
using System;
using Depo.Data.Models.Minio;
using Depo.Data.Models.Common;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Depo.Data.Models.Security;
using Depo.Data.Models.Definitions;
using System.Collections.Generic;
using Depo.Data.Models.Vehicle;
using Depo.Data.Models.Crm;

namespace Depo.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();

            string conStr = Configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<DepoDbContext>(options =>
            {
                options.UseMySql(conStr, new MySqlServerVersion(ServerVersion.AutoDetect(conStr)),
                    mysqlOptions =>
                    {
                        mysqlOptions.MigrationsAssembly("Depo.Data.Models");
                        mysqlOptions.EnableRetryOnFailure(
                                    maxRetryCount: 3,
                                    maxRetryDelay: TimeSpan.FromSeconds(30),
                                    errorNumbersToAdd: null
                                );
                    })
                .LogTo(Console.WriteLine, LogLevel.Information)
                .EnableSensitiveDataLogging()
                .EnableDetailedErrors();
            }, ServiceLifetime.Transient);

            var appSettingsSection = Configuration.GetSection("AppSettings");
            services.Configure<AppSettings>(appSettingsSection);
            var appSettings = appSettingsSection.Get<AppSettings>();
            appSettings.Version = Configuration.GetValue<string>("Version");
            services.AddSingleton<AppSettings>(appSettings);

            var minioConfigSection = Configuration.GetSection("MinioConfig");
            services.Configure<MinioSettings>(minioConfigSection);
            var xMinioConfig = minioConfigSection.Get<MinioSettings>();
            services.AddSingleton<MinioSettings>(xMinioConfig);

            var emailConfigSection = Configuration.GetSection("EmailConfig");
            services.Configure<EmailConfig>(emailConfigSection);
            var emailConfig = emailConfigSection.Get<EmailConfig>();
            services.AddSingleton<EmailConfig>(emailConfig);


            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

            services.AddAuthorization();
            services.AddControllers().AddNewtonsoftJson();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            InitializeMigrations(app);
            DefaultDataMigration(app);

            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader());

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

        }

        private static void InitializeMigrations(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                DepoDbContext dbContext = serviceScope.ServiceProvider.GetRequiredService<DepoDbContext>();

                if (dbContext.Database.GetPendingMigrations().Count() > 0)
                {
                    dbContext.Database.Migrate();
                }
            }
        }

        private static void DefaultDataMigration(IApplicationBuilder app)
        {
            using (var serviceScope = app.ApplicationServices.GetService<IServiceScopeFactory>().CreateScope())
            {
                DepoDbContext dbContext = serviceScope.ServiceProvider.GetRequiredService<DepoDbContext>();

                try
                {
                    Region region = dbContext.Region.FirstOrDefault(p => !p.IsDeleted && p.RegionName.Equals("Default"));
                    if (region == null)
                    {
                        region = new Region()
                        {
                            RegionName = "Default",
                            Address = "İstanbul",
                            strCityIds = "34"
                        };

                        dbContext.Region.Add(region);
                        dbContext.SaveChanges();
                    }

                    User user = dbContext.Users.FirstOrDefault(p => !p.IsDeleted && p.Email.Equals("admin@Depo.com.tr"));
                    if (user == null)
                    {
                        user = new User()
                        {
                            Address = "İstanbul",
                            Name = "admin",
                            Surname = "admin",
                            Email = "admin@Depo.com.tr",
                            PhoneNumber = "05339302820",
                            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Depo.Data.Models.Utility.Utility.sha256("Depo123456!")),
                            RegionId = region.Id,
                        };

                        dbContext.Users.Add(user);
                        dbContext.SaveChanges();
                    }

                    string rolePermissions =
                        "canCreateRole,canReadRole,canUpdateRole,canDeleteRole,canReadDashboard,canReadUser,canCreateUser,canReadUser,canUpdateUser,canDeleteUser,canReadHierarchy,canCreateHierarchy,canUpdateHierarchy,canDeleteHierarchy,canReadRegion,canCreateRegion,canUpdateRegion,canDeleteRegion,canReadCompetitor,canCreateCompetitor,canUpdateCompetitor,canDeleteCompetitor,canReadGroup,canCreateGroup,canUpdateGroup,canDeleteGroup,canReadCompany,canCreateCompany,canUpdateCompany,canDeleteCompany,canReadMerchant,canCreateMerchant,canUpdateMerchant,canDeleteMerchant,canReadVehicleBrand,canUpdateVehicleBrand,canCreateVehicleBrand,canDeleteVehicleBrand,canReadVehicleModel,canUpdateVehicleModel,canCreateVehicleModel,canDeleteVehicleModel,canReadVehicleCapacity,canUpdateVehicleCapacity,canCreateVehicleCapacity,canDeleteVehicleCapacity,canReadVehicle,canUpdateVehicle,canCreateVehicle,canDeleteVehicle,canReadWarehouse,canCreateWarehouse,canUpdateWarehouse,canDeleteWarehouse";
                    Role role = dbContext.Roles.FirstOrDefault(p => !p.IsDeleted && p.RoleName.Equals("Admin"));
                    if (role == null)
                    {
                        role = new Role()
                        {
                            RoleName = "Admin",
                            IsDefault = true,
                            RolePermissions = rolePermissions
                        };

                        dbContext.Roles.Add(role);
                        dbContext.SaveChanges();
                    }
                    else
                    {
                        role.RolePermissions = rolePermissions;
                        dbContext.Roles.Update(role);
                        dbContext.SaveChanges();
                    }

                    UserRole userRole = dbContext.UserRoles.FirstOrDefault(p => !p.IsDeleted && p.UserId == user.Id && p.RoleId == role.Id);
                    if (userRole == null)
                    {
                        userRole = new UserRole()
                        {
                            UserId = user.Id,
                            RoleId = role.Id
                        };

                        dbContext.UserRoles.Add(userRole);
                        dbContext.SaveChanges();
                    }

                    List<User> userList = dbContext.Users.Where(p => !p.IsDeleted && p.RegionId <= 0).ToList();
                    if (userList != null && userList.Any())
                    {
                        foreach (User usr in userList)
                        {
                            usr.RegionId = region.Id;
                        }

                        dbContext.Users.UpdateRange(userList);
                        dbContext.SaveChanges();
                    }

                    VehicleType vehicleType = dbContext.VehicleType.FirstOrDefault(p => !p.IsDeleted);
                    if (vehicleType == null)
                    {
                        dbContext.VehicleType.Add(new VehicleType()
                        {
                            TypeName = "Midi"
                        });

                        dbContext.VehicleType.Add(new VehicleType()
                        {
                            TypeName = "Mini"
                        });

                        dbContext.VehicleType.Add(new VehicleType()
                        {
                            TypeName = "Otomobil"
                        });

                        dbContext.VehicleType.Add(new VehicleType()
                        {
                            TypeName = "Otobüs"
                        });

                        dbContext.SaveChanges();
                    }

                    MerchantInterviewType interviewType = dbContext.MerchantInterviewType.FirstOrDefault(p => !p.IsDeleted);
                    if (interviewType == null)
                    {
                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "Mail"
                        });

                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "Telefon"
                        });

                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "WhatsApp"
                        });

                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "Skype"
                        });

                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "Online Toplantı"
                        });

                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "Müşteri Ziyareti"
                        });

                        dbContext.MerchantInterviewType.Add(new MerchantInterviewType()
                        {
                            InterviewType = "Müşteri Ağırlanması"
                        });

                        dbContext.SaveChanges();
                    }

                    VehicleTrackingDeviceCompany vehicleTrackingDeviceCompany = dbContext.VehicleTrackingDeviceCompany.FirstOrDefault(p => !p.IsDeleted);
                    if (vehicleTrackingDeviceCompany == null)
                    {
                        dbContext.VehicleTrackingDeviceCompany.Add(new VehicleTrackingDeviceCompany()
                        {
                            VehicleTrackingDeviceCompanyName = "Arvento"
                        });

                        dbContext.VehicleTrackingDeviceCompany.Add(new VehicleTrackingDeviceCompany()
                        {
                            VehicleTrackingDeviceCompanyName = "Infotech"
                        });

                        dbContext.SaveChanges();
                    }

                    SCVehicleType sCVehicleType = dbContext.SCVehicleType.FirstOrDefault(p => !p.IsDeleted);
                    if (sCVehicleType == null)
                    {
                        dbContext.SCVehicleType.Add(new SCVehicleType()
                        {
                            SCVehicleName = "Şirket Aracı"
                        });

                        dbContext.SCVehicleType.Add(new SCVehicleType()
                        {
                            SCVehicleName = "Taşeron Aracı"
                        });

                        dbContext.SCVehicleType.Add(new SCVehicleType()
                        {
                            SCVehicleName = "Kiralık Araç"
                        });

                        dbContext.SaveChanges();
                    }

                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }
        }
    }
}