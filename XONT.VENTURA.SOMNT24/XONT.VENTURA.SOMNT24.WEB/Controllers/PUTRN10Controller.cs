//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Data.SqlClient;
//using Microsoft.Extensions.Configuration;
//using System;
//using System.Collections.Generic;
//using System.Data;
//using XONT.Common.Extensions;
//using XONT.Common.Message;
//using XONT.VENTURA;
//using XONT.VENTURA.SOMNT24;
//using XONT.VENTURA.SOMNT24.DTOs;

//namespace XONT.VENTURA.SOMNT24
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class SOMNT24Controller : ControllerBase
//    {
//        private readonly ReturnTypeManager _returnManager;
//        private readonly IHttpContextAccessor _httpContextAccessor;
//        private readonly IConfiguration _configuration;
//        private User _user;
//        private MessageSet _message;
//        private string _update;

//        public SOMNT24Controller(IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
//        {
//            _httpContextAccessor = httpContextAccessor;
//            _configuration = configuration;
//            _returnManager = new ReturnTypeManager();
//        }

//        //[HttpPost("InsertReturnType")]
//        //public IActionResult InsertReturnType([FromBody] ReturnTypeInsertDto dto)
//        //{
//        //    try
//        //    {
//        //        _user = GetUser();
//        //        if (_user == null) return BadRequest(new { error = "User not found" });

//        //        string executionType = dto.pageType == "edit" ? "2" : "1";

//        //        var rtnType = new ReturnType
//        //        {
//        //            BusinessUnit = _user.BusinessUnit?.Trim(),
//        //            ModuleCode = dto.ModuleCode?.Trim(),
//        //            RetnType = dto.ReturnType?.Trim(),
//        //            Description = dto.Description?.Trim(),
//        //            ReturnCategory = dto.ReturnCategory?.Trim(),
//        //            ProcessingRequired = dto.SalableReturn ? "1" : "0",
//        //            Status = dto.Active ? "1" : "0",
//        //            ReturnDeductionType = dto.DeductFromSales ? "1" : "0",
//        //            ValidateReturnValue = dto.ReturnValueValidation switch
//        //            {
//        //                "No" => "0",
//        //                "Mandatory" => "1",
//        //                _ => "2"
//        //            },
//        //            TimeStamp = dto.pageType == "edit" ? dto.TimeStamp : null
//        //        };

//        //        string update = "";
//        //        _returnManager.UpdateReturnType(_user.BusinessUnit?.Trim(), _user.UserName?.Trim(), executionType, rtnType, ref _message, ref update);

//        //        if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//        //        return Ok(new { success = update == "1" });
//        //    }
//        //    catch (Exception ex)
//        //    {
//        //        return StatusCode(500, new { error = ex.Message });
//        //    }
//        //}
//        [HttpPost("InsertReturnType")]
//        public IActionResult InsertReturnType([FromBody] ReturnTypeInsertDto dto)
//        {
//            try
//            {
//                _user = GetUser();
//                if (_user == null) return BadRequest(new { error = "User not found" });

//                string executionType = (dto.pageType == "edit") ? "2" : "1";

//                var rtnType = new ReturnType
//                {
//                    BusinessUnit = _user.BusinessUnit?.Trim(),
//                    ModuleCode = dto.ModuleCode?.Trim(),
//                    RetnType = dto.ReturnType?.Trim(),
//                    Description = dto.Description?.Trim(),
//                    ReturnCategory = dto.ReturnCategory?.Trim(),
//                    ProcessingRequired = dto.SalableReturn ? "1" : "0",
//                    Status = dto.Active ? "1" : "0",
//                    ReturnDeductionType = dto.DeductFromSales ? "1" : "0",
//                    ValidateReturnValue = dto.ReturnValueValidation switch
//                    {
//                        "No" => "0",
//                        "Mandatory" => "1",
//                        _ => "2"
//                    }
//                };

//                // For EDIT operations, we need the TimeStamp for concurrency
//                if (dto.pageType == "edit")
//                {
//                    rtnType.TimeStamp = dto.TimeStamp;
//                }

//                string update = "";
//                _returnManager.UpdateReturnType(_user.BusinessUnit?.Trim(), _user.UserName?.Trim(), executionType, rtnType, ref _message, ref update);

//                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//                return Ok(new { success = update == "1" });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }
//        [HttpPost("ListReturnTypeData")]
//        public IActionResult ListReturnTypeData([FromBody] Selection selection)
//        {
//            try
//            {
//                _user = GetUser();
//                if (_user == null) return BadRequest(new { error = "User not found" });

//                selection.BusinessUnit = _user.BusinessUnit?.Trim();
//                int totalRow = 0;
//                DataTable dt = _returnManager.GetGridData(selection, out totalRow, ref _message);

//                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//                var result = new List<Dictionary<string, object>>();
//                foreach (DataRow row in dt.Rows)
//                {
//                    var dict = new Dictionary<string, object>();
//                    foreach (DataColumn col in dt.Columns) dict[col.ColumnName] = row[col];
//                    result.Add(dict);
//                }

//                return Ok(new { data = result, totalRow = totalRow });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        [HttpGet("GetModulePromptData")]
//        public IActionResult GetModulePromptData()
//        {
//            try
//            {
//                _user = GetUser();
//                if (_user == null) return BadRequest(new { error = "User not found" });

//                DataTable dt = _returnManager.GetModulePromptData(_user.BusinessUnit?.Trim(), ref _message);
//                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//                return Ok(new { data = dt });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        [HttpGet("SeletedReturnType")]
//        public IActionResult SeletedReturnType(string moduleCode, string returnType)
//        {
//            try
//            {
//                _user = GetUser();
//                if (_user == null) return BadRequest(new { error = "User not found" });

//                ReturnType retnType = _returnManager.SeletedReturnType(_user.BusinessUnit?.Trim(), moduleCode, returnType, ref _message);
//                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//                return Ok(new { data = retnType });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        [HttpGet("GetCategoryPromptData")]
//        public IActionResult GetCategoryPromptData()
//        {
//            try
//            {
//                _user = GetUser();
//                if (_user == null) return BadRequest(new { error = "User not found" });

//                DataTable dt = _returnManager.GetCategoryPromptData(_user.BusinessUnit?.Trim(), ref _message);
//                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//                return Ok(new { data = dt });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        [HttpGet("GetModulePromptDataForNew")]
//        public IActionResult GetModulePromptDataForNew()
//        {
//            try
//            {
//                _user = GetUser();
//                if (_user == null) return BadRequest(new { error = "User not found" });

//                DataTable dt = _returnManager.GetModulePromptDataForNew(_user.BusinessUnit?.Trim(), ref _message);
//                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

//                return Ok(new { data = dt });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new { error = ex.Message });
//            }
//        }

//        private User GetUser()
//        {
//            if (_user == null)
//            {
//                _user = _httpContextAccessor.HttpContext?.Session?.GetObject<User>("Main_LoginUser");
//                if (_user == null)
//                {
//                    _user = new User { UserName = "xontadmin", BusinessUnit = "LUCK" };
//                    _httpContextAccessor.HttpContext?.Session?.SetObject("Main_LoginUser", _user);
//                }
//            }
//            return _user;
//        }
//    }
//}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using XONT.Common.Extensions;
using XONT.Common.Message;
using XONT.VENTURA;
using XONT.VENTURA.SOMNT24;
using XONT.VENTURA.SOMNT24.DTOs;

namespace XONT.VENTURA.SOMNT24
{
    [Route("api/[controller]")]
    [ApiController]
    public class SOMNT24Controller : ControllerBase
    {
        private readonly ReturnTypeManager _returnManager;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IConfiguration _configuration;
        private User _user;
        private MessageSet _message;
        private string _update;

        public SOMNT24Controller(IHttpContextAccessor httpContextAccessor, IConfiguration configuration)
        {
            _httpContextAccessor = httpContextAccessor;
            _configuration = configuration;
            _returnManager = new ReturnTypeManager();
        }

        [HttpPost("InsertReturnType")]
        public IActionResult InsertReturnType([FromBody] ReturnTypeInsertDto dto)
        {
            try
            {
                _user = GetUser();
                if (_user == null) return BadRequest(new { error = "User not found" });

                string executionType = (dto.pageType == "edit") ? "2" : "1";

                var rtnType = new ReturnType
                {
                    BusinessUnit = _user.BusinessUnit?.Trim(),
                    ModuleCode = dto.ModuleCode?.Trim(),
                    RetnType = dto.ReturnType?.Trim(),
                    Description = dto.Description?.Trim(),
                    ReturnCategory = dto.ReturnCategory?.Trim(),
                    ProcessingRequired = dto.SalableReturn ? "1" : "0",
                    Status = dto.Active ? "1" : "0",
                    ReturnDeductionType = dto.DeductFromSales ? "1" : "0",
                    ValidateReturnValue = dto.ReturnValueValidation switch
                    {
                        "No" => "0",
                        "Mandatory" => "1",
                        _ => "2"
                    }
                };

                // For EDIT operations, we need the TimeStamp for concurrency
                if (dto.pageType == "edit")
                {
                    rtnType.TimeStamp = dto.TimeStamp;
                }

                string update = "";
                _returnManager.UpdateReturnType(_user.BusinessUnit?.Trim(), _user.UserName?.Trim(), executionType, rtnType, ref _message, ref update);

                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

                return Ok(new { success = update == "1" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("ListReturnTypeData")]
        public IActionResult ListReturnTypeData([FromBody] Selection selection)
        {
            try
            {
                _user = GetUser();
                if (_user == null) return BadRequest(new { error = "User not found" });

                selection.BusinessUnit = _user.BusinessUnit?.Trim();
                int totalRow = 0;
                DataTable dt = _returnManager.GetGridData(selection, out totalRow, ref _message);

                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

                // Convert DataTable to List for proper JSON serialization
                var result = ConvertDataTableToList(dt);
                return Ok(new { data = result, totalRow = totalRow });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("GetModulePromptData")]
        public IActionResult GetModulePromptData()
        {
            try
            {
                _user = GetUser();
                if (_user == null) return BadRequest(new { error = "User not found" });

                DataTable dt = _returnManager.GetModulePromptData(_user.BusinessUnit?.Trim(), ref _message);
                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

                // Convert DataTable to List for proper JSON serialization
                var result = ConvertDataTableToList(dt);
                return Ok(new { data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("GetModulePromptDataForNew")]
        public IActionResult GetModulePromptDataForNew()
        {
            try
            {
                _user = GetUser();
                if (_user == null) return BadRequest(new { error = "User not found" });

                DataTable dt = _returnManager.GetModulePromptDataForNew(_user.BusinessUnit?.Trim(), ref _message);
                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

                // Convert DataTable to List for proper JSON serialization
                var result = ConvertDataTableToList(dt);
                return Ok(new { data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("GetCategoryPromptData")]
        public IActionResult GetCategoryPromptData()
        {
            try
            {
                _user = GetUser();
                if (_user == null) return BadRequest(new { error = "User not found" });

                DataTable dt = _returnManager.GetCategoryPromptData(_user.BusinessUnit?.Trim(), ref _message);
                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

                // Convert DataTable to List for proper JSON serialization
                var result = ConvertDataTableToList(dt);
                return Ok(new { data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("SeletedReturnType")]
        public IActionResult SeletedReturnType(string moduleCode, string returnType)
        {
            try
            {
                _user = GetUser();
                if (_user == null) return BadRequest(new { error = "User not found" });

                ReturnType retnType = _returnManager.SeletedReturnType(_user.BusinessUnit?.Trim(), moduleCode, returnType, ref _message);
                if (_message?.HasErrors == true) return StatusCode(500, new { error = _message.Errors });

                // ReturnType object serializes fine - no DataTable conversion needed
                return Ok(new { data = retnType });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // Helper method to convert DataTable to List of Dictionaries
        private List<Dictionary<string, object>> ConvertDataTableToList(DataTable dt)
        {
            var result = new List<Dictionary<string, object>>();

            if (dt == null || dt.Rows.Count == 0)
                return result;

            foreach (DataRow row in dt.Rows)
            {
                var dict = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    // Handle DBNull values by converting to null
                    dict[col.ColumnName] = row[col] != DBNull.Value ? row[col] : null;
                }
                result.Add(dict);
            }
            return result;
        }

        private User GetUser()
        {
            if (_user == null)
            {
                _user = _httpContextAccessor.HttpContext?.Session?.GetObject<User>("Main_LoginUser");
                if (_user == null)
                {
                    _user = new User { UserName = "xontadmin", BusinessUnit = "LUCK" };
                    _httpContextAccessor.HttpContext?.Session?.SetObject("Main_LoginUser", _user);
                    _httpContextAccessor.HttpContext?.Session?.SetString("Main_UserName", "xontadmin");
                    _httpContextAccessor.HttpContext?.Session?.SetString("Main_BusinessUnit", "LUCK");
                }
            }
            return _user;
        }
    }
}