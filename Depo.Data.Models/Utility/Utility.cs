using Depo.Data.Model;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Depo.Data.Models.Utility
{
    public static class Utility
    {
        public static CurrentUser GetCurrentUser(ClaimsPrincipal user)
        {
            if (user == null)
                return null;

            var curUser = new CurrentUser();

            curUser.Username = user.Identity.Name;

            if (user.Claims.Any(x => x.Type == DepoClaimTypes.Email))
                curUser.Email = user.Claims.Where(x => x.Type == DepoClaimTypes.Email).Select(x => x.Value).FirstOrDefault();

            if (user.Claims.Any(x => x.Type == DepoClaimTypes.Role))
                curUser.Role = user.Claims.Where(x => x.Type == DepoClaimTypes.Role).Select(x => x.Value).FirstOrDefault();

            if (user.Claims.Any(x => x.Type == DepoClaimTypes.Id))
                curUser.Id = long.Parse(user.Claims.Where(x => x.Type == DepoClaimTypes.Id).Select(x => x.Value).FirstOrDefault());

            if (user.Claims.Any(x => x.Type == DepoClaimTypes.Permission))
                curUser.Permissions = user.Claims.Where(x => x.Type == DepoClaimTypes.Permission).Select(x => x.Value);


            return curUser;
        }

        public static bool PasswordRegexValidator(string password)
        {

            var hasNumber = new Regex(@"[0-9]+");
            var hasUpperChar = new Regex(@"[A-Z]+");
            var hasLowerChar = new Regex(@"[a-z]+");
            var hasMinSixChars = new Regex(@".{6,}");
            var hasSymbols = new Regex(@"[!@#$%^&*()_+=\[{\]};:<>|./?,-]");

            if (!hasNumber.IsMatch(password))
            {
                return false;
            }
            else if (!hasUpperChar.IsMatch(password))
            {
                return false;
            }
            else if (!hasLowerChar.IsMatch(password))
            {
                return false;
            }
            else if (!hasMinSixChars.IsMatch(password))
            {
                return false;
            }
            else if (!hasSymbols.IsMatch(password))
            {
                return false;
            }

            return true;
        }

        public static bool EmailRegexValidator(string email)
        {

            var emailFormat = new Regex(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$");
            if (!emailFormat.IsMatch(email))
            {
                return false;
            }

            return true;
        }

        public static bool PhoneRegexValidator(string phone)
        {
            var phoneFormat = new Regex(@"^\(?([0-9]{3})\)?([0-9]{3})?([0-9]{4})$");
            if (!phoneFormat.IsMatch(String.Concat(phone.Where(c => !Char.IsWhiteSpace(c)))))
            {
                return false;
            }

            return true;
        }

        public static string sha256(string value)
        {
            using (SHA256 _sha256 = SHA256.Create())
            {
                byte[] bytes = _sha256.ComputeHash(Encoding.UTF8.GetBytes(value));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

        public static string CreateCode(int length)
        {
            Random rand = new Random();
            string code = string.Empty;
            for (int i = 0; i < length; i++)
            {
                if (rand.Next(0, 2) == 0)
                    code += (char)rand.Next(47, 58);
                else
                    code += (char)rand.Next(64, 91);

            }
            return code;
        }
        public static string CreateNewPassword()
        {
            Random rand = new Random();
            int length = rand.Next(8, 13);
            int biggerWord = rand.Next(0, 3);
            int lowerWord = rand.Next(3, 5);
            int specify = rand.Next(7, length);
            int number = rand.Next(5, 7);

            string password = String.Empty;

            for (int i = 0; i < length; i++)
            {
                if (i == number)
                    password += (char)rand.Next(47, 58);
                else if (i == biggerWord)
                    password += (char)rand.Next(64, 91);
                else if (i == specify)
                    password += (char)33;
                else if (i == lowerWord)
                    password += (char)rand.Next(97, 123);
                else
                {
                    int random = rand.Next(0, 3);
                    if (random == 0)
                        password += (char)rand.Next(47, 58);
                    else if (random == 1)
                        password += (char)rand.Next(64, 91);
                    else if (random == 2)
                        password += (char)33;
                    else if (random == 3)
                        password += (char)rand.Next(97, 123);
                }
            }

            return password;
        }

        public static Bitmap ResizeImage(Image image, int width, int height)
        {
            return new Bitmap(image, new Size(new Point() { X = width, Y = height }));
        }
    }
}
