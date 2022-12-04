using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Security;
using Depo.Data.Models.Utility;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Security
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly AppSettings _appSettings;
        private readonly EmailConfig _emailConfig;

        public UsersController(DepoDbContext context, AppSettings appSettings, EmailConfig emailConfig)
        {
            _context = context;
            _appSettings = appSettings;
            _emailConfig = emailConfig;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadUser")]
        public async Task<DepoApiResponse> GetAll()
        {
            var res = new DepoApiResponse(false);

            try
            
            {
                var user = await _context.Users.Where(p => !p.IsDeleted && p.IsActive).Select(p => new User()
                {
                    Id = p.Id,
                    Name = p.Name,
                    Surname = p.Surname,

                }).ToListAsync();

                if (user == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    return res;
                }

                res = new DepoApiResponse(true);
                res.Data = user;

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpGet("{id}")]
        [PermissionRequirement(only: "canReadUser")]
        public async Task<DepoApiResponse> GetUser(int id)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    return res;
                }

                res = new DepoApiResponse(true);
                user.Password = null;
                user.PasswordHash = null;
                res.Data = user;

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpGet("find")]
        [PermissionRequirement(only: "canReadUser")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = (from u in _context.Users
                             join r in _context.Region.Where(p => !p.IsDeleted) on u.RegionId equals r.Id
                             where !u.IsDeleted
                             select new User()
                             {
                                 Address = u.Address,
                                 CreateDate = u.CreateDate,
                                 CreatorUserId = u.CreatorUserId,
                                 Email = u.Email,
                                 RegionId = u.RegionId,
                                 IsDeleted = u.IsDeleted,
                                 FailAttempCount = u.FailAttempCount,
                                 Id = u.Id,
                                 IsActive = u.IsActive,
                                 ModifiedDate = u.ModifiedDate,
                                 ModifierUserId = u.ModifierUserId,
                                 Name = u.Name,
                                 PhoneNumber = u.PhoneNumber,
                                 Surname = u.Surname,
                                 RegionName = r.RegionName
                             });

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.Name.Contains(filter.SearchText)
                        || u.Surname.Contains(filter.SearchText)
                        || u.Email.Contains(filter.SearchText)
                        || u.PhoneNumber.Contains(filter.SearchText)
                        || u.RegionName.Contains(filter.SearchText)
                        );
                    }
                }

                query = query.OrderByDescending(o => o.Id);

                var result = await query.ToPagedListAsync(pageNumber, pageSize);

                res = new DepoApiResponse(true);
                res.Data = result;

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [AllowAnonymous]
        [HttpPost("forgot-password")]
        public async Task<DepoApiResponse> ForgotPassword(ForgotPassword forgotPassword)
        {
            var res = new DepoApiResponse(false);

            try
            {
                #region Check Null And User With Email

                if (forgotPassword == null || string.IsNullOrEmpty(forgotPassword.Email))
                    return res;

                var user = await _context.Users.Where(p => p.Email.Equals(forgotPassword.Email)).FirstOrDefaultAsync();
                if (user == null)
                    return res;

                #endregion

                #region Create A Code

                string code = Utility.CreateCode(6);

                #endregion

                #region Create Model

                Otp otp = new Otp()
                {
                    UserId = user.Id,
                    OtpCode = code,
                    CreateDate = DateTime.UtcNow,
                };

                #endregion

                _context.Otps.Add(otp);
                await _context.SaveChangesAsync();

                #region Send Email

                var message = new MimeMessage();
                string emailAddress = forgotPassword.Email;
                //message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                message.Subject = "Changing Password.";
                message.From.Add(new MailboxAddress("Çetur Panel", _emailConfig.Username));
                message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                { Text = $"Your password is resetted. If you don't have any information about this, please notify authorized people or change your password for security of your account. Code is: {code}" };
                using (var smtp = new SmtpClient())
                {
                    smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    await smtp.ConnectAsync(_emailConfig.EmailServer, _emailConfig.EmailServerPort, _emailConfig.UseTls ? MailKit.Security.SecureSocketOptions.StartTls : MailKit.Security.SecureSocketOptions.None).ConfigureAwait(false);
                    await smtp.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password).ConfigureAwait(false);
                    await smtp.SendAsync(message).ConfigureAwait(false);
                    await smtp.DisconnectAsync(true).ConfigureAwait(false);
                }

                #endregion

                #region Send Response

                res = new DepoApiResponse(true);
                res.Message = "Otp is sended your email";
                res.Data = forgotPassword.Email;

                #endregion

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [AllowAnonymous]
        [HttpPost("forgot-password-confirm-code")]
        public async Task<DepoApiResponse> ForgotPasswordAccept(ForgotPassword forgotPassword)
        {
            var res = new DepoApiResponse(false);

            try
            {
                #region Check Null And Get Otp With Email

                if (forgotPassword == null || string.IsNullOrEmpty(forgotPassword.Email) || string.IsNullOrEmpty(forgotPassword.OtpCode))
                    return res;

                var otp = await (from u in _context.Users
                                 join o in _context.Otps on u.Id equals o.UserId
                                 where u.Email == forgotPassword.Email
                                 select o).OrderByDescending(p => p.CreateDate).FirstOrDefaultAsync();

                if (otp == null)
                    return res;

                #endregion

                #region Control Code

                if (otp.CreateDate.AddMinutes(5) <= DateTime.UtcNow)
                    return res;

                if (!otp.OtpCode.Equals(forgotPassword.OtpCode.ToUpper()))
                    return res;

                #endregion

                #region Get User

                var user = await _context.Users.Where(p => p.Id == otp.UserId).FirstOrDefaultAsync();
                if (user == null)
                    return res;

                #endregion

                #region Send Email

                //var message = new MimeMessage();
                //string emailAddress = forgotPassword.Email;
                ////message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                //message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                //message.Subject = "Password Changed";
                //message.From.Add(new MailboxAddress("Çetur Panel", _emailConfig.Username));
                //message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                //{ Text = $"Your password is resetted. If you don't have any information about this, please notify authorized people or change your password for security of your account." };
                //using (var smtp = new SmtpClient())
                //{
                //    smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                //    await smtp.ConnectAsync(_emailConfig.EmailServer, _emailConfig.EmailServerPort, _emailConfig.UseTls ? MailKit.Security.SecureSocketOptions.StartTls : MailKit.Security.SecureSocketOptions.None).ConfigureAwait(false);
                //    await smtp.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password).ConfigureAwait(false);
                //    await smtp.SendAsync(message).ConfigureAwait(false);
                //    await smtp.DisconnectAsync(true).ConfigureAwait(false);
                //}

                #endregion

                #region Send Response

                res = new DepoApiResponse(true);
                res.Message = "Code Is True.";

                #endregion

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [AllowAnonymous]
        [HttpPost("change-password")]
        public async Task<DepoApiResponse> ChangePassword(ForgotPassword forgotPassword)
        {
            var res = new DepoApiResponse(false);

            try
            {
                #region Check Null And Get Otp With Email

                if (forgotPassword == null || string.IsNullOrEmpty(forgotPassword.Email) || string.IsNullOrEmpty(forgotPassword.NewPassword) || string.IsNullOrEmpty(forgotPassword.OtpCode))
                    return res;

                var otp = await (from u in _context.Users
                                 join o in _context.Otps on u.Id equals o.UserId
                                 where u.Email == forgotPassword.Email
                                 select o).OrderByDescending(p => p.CreateDate).FirstOrDefaultAsync();

                if (otp == null)
                    return res;

                #endregion

                #region Check Otp

                if (otp.CreateDate.AddMinutes(10) <= DateTime.UtcNow)
                    return res;

                if (!otp.OtpCode.Equals(forgotPassword.OtpCode.ToUpper()))
                    return res;

                #endregion

                #region Update User Model

                var user = await _context.Users.Where(p => p.Id == otp.UserId).FirstOrDefaultAsync();
                if (user == null)
                    return res;

                user.IsActive = true;
                user.PasswordUpdateDate = DateTime.UtcNow;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(Depo.Data.Models.Utility.Utility.sha256(forgotPassword.NewPassword));
                user.ModifiedDate = DateTime.UtcNow;
                #endregion

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                #region Send Email

                var message = new MimeMessage();
                string emailAddress = forgotPassword.Email;
                //message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                message.Subject = "Changing Password.";
                message.From.Add(new MailboxAddress("Çetur Panel", _emailConfig.Username));
                message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                { Text = $"Your password is resetted. If you don't have any information about this, please notify authorized people or change your password for security of your account." };
                using (var smtp = new SmtpClient())
                {
                    smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    await smtp.ConnectAsync(_emailConfig.EmailServer, _emailConfig.EmailServerPort, _emailConfig.UseTls ? MailKit.Security.SecureSocketOptions.StartTls : MailKit.Security.SecureSocketOptions.None).ConfigureAwait(false);
                    await smtp.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password).ConfigureAwait(false);
                    await smtp.SendAsync(message).ConfigureAwait(false);
                    await smtp.DisconnectAsync(true).ConfigureAwait(false);
                }

                #endregion

                #region Send Response

                res = new DepoApiResponse(true);
                res.Message = "Password Is Successfully Changed";

                #endregion

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpPost("change-password-in-panel")]
        public async Task<DepoApiResponse> ChangePassword2(ChangePassword changePassword)
        {
            var res = new DepoApiResponse(false);
            var getUser = Utility.GetCurrentUser(User);
            long userId = getUser.Id;
            string email = getUser.Email;
            try
            {
                #region Check Null

                if (changePassword == null || string.IsNullOrEmpty(changePassword.NewPassword) || string.IsNullOrEmpty(changePassword.OldPassword))
                    return res;

                #endregion

                #region Get User And Check Passwords 

                var user = await _context.Users.Where(p => p.Id == userId).FirstOrDefaultAsync();
                if (user == null)
                    return res;

                if (!Utility.PasswordRegexValidator(changePassword.NewPassword))
                    return res;

                if (!BCrypt.Net.BCrypt.Verify(Depo.Data.Models.Utility.Utility.sha256(changePassword.OldPassword), user.PasswordHash))
                    return res;

                #endregion

                #region Update User

                user.IsActive = true;
                user.PasswordUpdateDate = DateTime.UtcNow;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(Depo.Data.Models.Utility.Utility.sha256(changePassword.NewPassword));
                user.ModifiedDate = DateTime.UtcNow;
                user.ModifierUserId = userId;

                #endregion

                _context.Users.Update(user);
                await _context.SaveChangesAsync();

                #region Send Email

                var message = new MimeMessage();
                string emailAddress = email;
                //message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                message.To.Add(new MimeKit.MailboxAddress(emailAddress, emailAddress));
                message.Subject = "Changing Password.";
                message.From.Add(new MailboxAddress("Çetur Panel", _emailConfig.Username));
                message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
                { Text = $"Your password is resetted. If you don't have any information about this, please notify authorized people or change your password for security of your account." };
                using (var smtp = new SmtpClient())
                {
                    smtp.ServerCertificateValidationCallback = (s, c, h, e) => true;
                    await smtp.ConnectAsync(_emailConfig.EmailServer, _emailConfig.EmailServerPort, _emailConfig.UseTls ? MailKit.Security.SecureSocketOptions.StartTls : MailKit.Security.SecureSocketOptions.None).ConfigureAwait(false);
                    await smtp.AuthenticateAsync(_emailConfig.Username, _emailConfig.Password).ConfigureAwait(false);
                    await smtp.SendAsync(message).ConfigureAwait(false);
                    await smtp.DisconnectAsync(true).ConfigureAwait(false);
                }

                #endregion

                #region Send Response

                res = new DepoApiResponse(true);
                res.Message = "Password Is Successfully Changed";

                #endregion

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpPut("changestatus/{id}")]
        [PermissionRequirement(only: "canUpdateUser")]
        public async Task<DepoApiResponse> ChangeStatus(int id)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var updatedModel = _context.Users.Where(x => x.Id == id).FirstOrDefault();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.IsActive = !updatedModel.IsActive;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.Entry(updatedModel).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

        [HttpDelete("{id}")]
        [PermissionRequirement(only: "canDeleteUser")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                user.ModifiedDate = DateTime.UtcNow;
                user.ModifierUserId = Utility.GetCurrentUser(User).Id;
                user.IsDeleted = true;
                _context.Users.Update(user);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_DELETED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }
            return res;
        }

        [HttpPost]
        [PermissionRequirement(only: "canCreateUser")]
        public async Task<DepoApiResponse> Create(User user)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(user.Name))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    user.Name = user.Name.Trim();
                }

                if (string.IsNullOrEmpty(user.Surname))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_SURNAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    user.Surname = user.Surname.Trim();
                }

                if (string.IsNullOrEmpty(user.Password))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_PASSWORD";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    user.Password = user.Password.Trim();
                }

                if (string.IsNullOrEmpty(user.Email))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "EMAIL_IS_EMPTY";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (!Utility.PasswordRegexValidator(user.Password))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "PASSWORD_IS_WRONG_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (!Utility.EmailRegexValidator(user.Email))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "EMAIL_IS_WRONG_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    if (!Utility.PhoneRegexValidator(user.PhoneNumber))
                    {
                        res.Type = DepoApiMessageType.Form;
                        res.Message = "PHONE_IS_WRONG_TYPE";
                        Console.WriteLine(res.Message);
                        return res;
                    }
                }

                if (user.RegionId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "REGION_IS_EMPTY";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsEmail = await _context.Users.AnyAsync(x => !x.IsDeleted && x.Email == user.Email);
                if (existsEmail)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_EMAIL";
                    Console.WriteLine(res.Message);
                    return res;
                }

                user.IsActive = true;
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(Depo.Data.Models.Utility.Utility.sha256(user.Password));
                user.PasswordUpdateDate = DateTime.MinValue;
                user.CreateDate = DateTime.UtcNow;
                user.CreatorUserId = Utility.GetCurrentUser(User).Id;

                await _context.Users.AddAsync(user);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_CREATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

        [HttpPut("{id}")]
        [PermissionRequirement(only: "canUpdateUser")]
        public async Task<DepoApiResponse> Update(int id, User user)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != user.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Users.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(user.Name))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    user.Name = user.Name.Trim();
                }

                if (string.IsNullOrEmpty(user.Surname))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_SURNAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    user.Surname = user.Surname.Trim();
                }

                if (user.RegionId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "REGION_IS_EMPTY";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsEmail = _context.Users.Any(x => !x.IsDeleted && x.Email == user.Email && x.Id != id);
                if (existsEmail)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_EMAIL";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(user.Email))
                {
                    Console.WriteLine(res.Message);
                    res.Message = "MISSING_PARAMETER_EMAIL";
                    return res;
                }

                if (!Utility.EmailRegexValidator(user.Email))
                {
                    Console.WriteLine(res.Message);
                    res.Message = "UNEXPECTED_MAIL_FORMAT";
                    return res;
                }

                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    if (!Utility.PhoneRegexValidator(user.PhoneNumber))
                    {
                        res.Type = DepoApiMessageType.Form;
                        res.Message = "PHONE_IS_WRONG_TYPE";
                        Console.WriteLine(res.Message);
                        return res;
                    }
                }

                updatedModel.Name = user.Name;
                updatedModel.Surname = user.Surname;
                updatedModel.PhoneNumber = user.PhoneNumber;
                updatedModel.RegionId = user.RegionId;
                updatedModel.Email = user.Email;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.Entry(updatedModel).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

    }
}
