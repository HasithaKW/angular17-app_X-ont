using System;
using System.Collections.Generic;
using System.Data;
using System.Transactions;
using XONT.Common.Data;
using XONT.Common.Message;

namespace XONT.VENTURA.SOMNT24
{
    public class ReturnTypeDAL
    {
        private readonly CommonDBService dbService;
        private DataTable dTable;
        private ParameterSet _common;
        private ReturnType rtnType;

        public ReturnTypeDAL()
        {
            dbService = new CommonDBService();
        }

        public DataTable ExistTransactionDAL(string businessUnit, string ExistReturn, ref MessageSet message)
        {
            DataTable dtresult = null;
            message = null;
            try
            {
                ParameterSet param = new ParameterSet();
                var spParametersList = new List<SPParameter>();
                param.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
                param.SetSPParameterList(spParametersList, "ReturnType", ExistReturn, "");
                param.SetSPParameterList(spParametersList, "ExecutionType", "7", "");
                dbService.StartService();
                dtresult = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList);
            }
            catch (Exception ex)
            {
                message = MessageCreate.CreateErrorMessage(0, ex, "ExistTransactionDAL", "XONT.VENTURA.SOMNT24.DAL");
            }
            finally
            {
                dbService.CloseService();
            }
            return dtresult;
        }

        public ReturnType SeletedReturnType(string businessUnit, string moduleCode, string returnType, ref MessageSet _msg)
        {
            dbService.StartService();
            try
            {
                ParameterSet param = new ParameterSet();
                var spParametersList = new List<SPParameter>();
                param.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
                param.SetSPParameterList(spParametersList, "ReturnType", returnType, "");
                param.SetSPParameterList(spParametersList, "ModuleCode", moduleCode, "");
                param.SetSPParameterList(spParametersList, "ExecutionType", "6", "");

                rtnType = new ReturnType();
                dTable = new DataTable("DataTable");
                dTable = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList);

                foreach (DataRow dtRow in dTable.Rows)
                {
                    rtnType.ModuleCode = dtRow["ModuleCode"].ToString().Trim();
                    rtnType.ModuleCodeDesc = dtRow["ModuleCodeDesc"].ToString().Trim();
                    rtnType.RetnType = dtRow["ReturnType"].ToString().Trim();
                    rtnType.Description = dtRow["Description"].ToString().Trim();
                    rtnType.ReturnCategory = dtRow["ReturnCategory"].ToString().Trim();
                    rtnType.ReturnCategoryDesc = dtRow["ReturnCategoryDesc"].ToString().Trim();
                    rtnType.ProcessingRequired = dtRow["ProcessingRequired"].ToString().Trim();
                    rtnType.Status = dtRow["Status"].ToString().Trim();
                    rtnType.TimeStamp = (byte[])dtRow["TimeStamp"];
                    rtnType.ReturnDeductionType = dtRow["ReturnDeductionType"].ToString().Trim();
                    rtnType.ValidateReturnValue = dtRow["ValidateReturnValue"].ToString().Trim();
                }
            }
            catch (Exception ex)
            {
                _msg = MessageCreate.CreateErrorMessage(0, ex, "SeletedReturnType", "XONT.VENTURA.SOMNT24.DAL.dll");
            }
            finally
            {
                dbService.CloseService();
            }
            return rtnType;
        }
        public void UpdateReturnType(string businessUnit, string userName, string executionType, ReturnType rtnType, ref MessageSet _msg, ref string update)
        {
            try
            {
                dbService.StartService();

                using (var ts = new TransactionScope(TransactionScopeOption.Required))
                {
                    _common = new ParameterSet();
                    var spParametersList = new List<SPParameter>();

                    // Add all required parameters
                    _common.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
                    _common.SetSPParameterList(spParametersList, "ModuleCode", rtnType.ModuleCode?.Trim(), "");
                    _common.SetSPParameterList(spParametersList, "ReturnType", rtnType.RetnType?.Trim(), "");
                    _common.SetSPParameterList(spParametersList, "Description", rtnType.Description?.Trim(), "");
                    _common.SetSPParameterList(spParametersList, "ReturnCategory", rtnType.ReturnCategory?.Trim(), "");
                    _common.SetSPParameterList(spParametersList, "ProcessingRequired", rtnType.ProcessingRequired?.Trim(), "");
                    _common.SetSPParameterList(spParametersList, "CreatedBy", userName, "");
                    _common.SetSPParameterList(spParametersList, "LastUpdatedBy", userName, "");
                    _common.SetSPParameterList(spParametersList, "Status", rtnType.Status?.Trim(), "");

                    // CRITICAL: Only add TimeStamp for UPDATE when it has a valid byte array
                    if (executionType == "2" && rtnType.TimeStamp != null && rtnType.TimeStamp.Length > 0)
                    {
                        _common.SetSPParameterList(spParametersList, "TimeStamp", rtnType.TimeStamp, "");
                        Console.WriteLine("TimeStamp added with valid value");
                    }
                    else if (executionType == "2")
                    {
                        Console.WriteLine("TimeStamp is null or empty - NOT adding parameter");
                    }
                    // For INSERT, never add TimeStamp

                    _common.SetSPParameterList(spParametersList, "ExecutionType", executionType, "");
                    _common.SetSPParameterList(spParametersList, "ReturnDeductionType", rtnType.ReturnDeductionType?.Trim(), "");
                    _common.SetSPParameterList(spParametersList, "ValidateReturnValue", rtnType.ValidateReturnValue?.Trim(), "");

                    // Debug logging
                    Console.WriteLine($"=== UpdateReturnType - ExecutionType: {executionType} ===");
                    foreach (var p in spParametersList)
                    {
                        if (p.Name == "TimeStamp" && p.Value is byte[] bytes)
                        {
                            Console.WriteLine($"  @{p.Name} = {BitConverter.ToString(bytes)}");
                        }
                        else
                        {
                            Console.WriteLine($"  @{p.Name} = {p.Value}");
                        }
                    }

                    string commandText = "RD.usp_SOMNT24UpdateReturnType";
                    int i = dbService.ExcecuteWithReturn(CommonVar.DBConName.UserDB, commandText, spParametersList);
                    update = i > 0 ? "1" : "0";

                    if (update == "1" && rtnType.ModuleCode?.Trim() == "RD")
                    {
                        IWebControlManager webContol = new WebControlManager();
                        webContol.UpdateWebControl(businessUnit, userName, "", "RD.ReturnType", "Return Type", "", "", ref _msg);
                    }

                    ts.Complete();
                }
            }
            catch (Exception ex)
            {
                _msg = MessageCreate.CreateErrorMessage(0, ex, "UpdateReturnType", "XONT.VENTURA.SOMNT24.DAL.dll");
            }
            finally
            {
                dbService.CloseService();
            }
        }
        //public void UpdateReturnType(string businessUnit, string userName, string executionType, ReturnType rtnType, ref MessageSet _msg, ref string update)
        //{
        //    try
        //    {
        //        dbService.StartService();

        //        using (var ts = new TransactionScope(TransactionScopeOption.Required))
        //        {
        //            _common = new ParameterSet();
        //            var spParametersList = new List<SPParameter>();

        //            // Add all required parameters (excluding TimeStamp for now)
        //            _common.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
        //            _common.SetSPParameterList(spParametersList, "ModuleCode", rtnType.ModuleCode?.Trim(), "");
        //            _common.SetSPParameterList(spParametersList, "ReturnType", rtnType.RetnType?.Trim(), "");
        //            _common.SetSPParameterList(spParametersList, "Description", rtnType.Description?.Trim(), "");
        //            _common.SetSPParameterList(spParametersList, "ReturnCategory", rtnType.ReturnCategory?.Trim(), "");
        //            _common.SetSPParameterList(spParametersList, "ProcessingRequired", rtnType.ProcessingRequired?.Trim(), "");
        //            _common.SetSPParameterList(spParametersList, "CreatedBy", userName, "");
        //            _common.SetSPParameterList(spParametersList, "LastUpdatedBy", userName, "");
        //            _common.SetSPParameterList(spParametersList, "Status", rtnType.Status?.Trim(), "");

        //            // TimeStamp - ONLY for UPDATE (executionType == "2")
        //            if (executionType == "2")
        //            {
        //                if (rtnType.TimeStamp != null && rtnType.TimeStamp.Length > 0)
        //                {
        //                    _common.SetSPParameterList(spParametersList, "TimeStamp", rtnType.TimeStamp, "");
        //                }
        //                else
        //                {
        //                    // If no timestamp is provided for update, pass NULL (stored procedure will ignore it)
        //                    _common.SetSPParameterList(spParametersList, "TimeStamp", DBNull.Value, "");
        //                }
        //            }
        //            // For INSERT (executionType == "1"), DO NOT add TimeStamp parameter at all
        //            // For INSERT (executionType == "1"), we skip adding TimeStamp completely

        //            _common.SetSPParameterList(spParametersList, "ExecutionType", executionType, "");
        //            _common.SetSPParameterList(spParametersList, "ReturnDeductionType", rtnType.ReturnDeductionType?.Trim(), "");
        //            _common.SetSPParameterList(spParametersList, "ValidateReturnValue", rtnType.ValidateReturnValue?.Trim(), "");


        //            // Debug: Log all parameters
        //            Console.WriteLine($"=== UpdateReturnType - ExecutionType: {executionType} ===");
        //            foreach (var p in spParametersList)
        //            {
        //                Console.WriteLine($"  @{p.Name} = {p.Value}");
        //            }

        //            string commandText = "RD.usp_SOMNT24UpdateReturnType";
        //            int i = dbService.ExcecuteWithReturn(CommonVar.DBConName.UserDB, commandText, spParametersList);
        //            update = i > 0 ? "1" : "0";

        //            if (update == "1" && rtnType.ModuleCode?.Trim() == "RD")
        //            {
        //                IWebControlManager webContol = new WebControlManager();
        //                webContol.UpdateWebControl(businessUnit, userName, "", "RD.ReturnType", "Return Type", "", "", ref _msg);
        //            }

        //            ts.Complete();
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        _msg = MessageCreate.CreateErrorMessage(0, ex, "UpdateReturnType", "XONT.VENTURA.SOMNT24.DAL.dll");
        //    }
        //    finally
        //    {
        //        dbService.CloseService();
        //    }
        //}

        public DataTable GetGridData(Selection selected, out int rowCount, ref MessageSet msg)
        {
            rowCount = 0;
            try
            {
                dbService.StartService();
                ParameterSet param = new ParameterSet();
                var spParametersList = new List<SPParameter>();
                param.SetSPParameterList(spParametersList, "BusinessUnit", selected.BusinessUnit.ToString(), "");
                param.SetSPParameterList(spParametersList, "ReturnType", selected.RetnType ?? "", "");
                param.SetSPParameterList(spParametersList, "Description", selected.Description ?? "", "");
                param.SetSPParameterList(spParametersList, "ModuleCode", selected.ModuleCode ?? "", "");
                param.SetSPParameterList(spParametersList, "ModuleCodeDesc", selected.ModuleCodeDesc ?? "", "");
                param.SetSPParameterList(spParametersList, "FirstRow", selected.FirstRow.ToString(), "");
                param.SetSPParameterList(spParametersList, "LastRow", selected.LastRow.ToString(), "");
                param.SetSPParameterList(spParametersList, "Status", selected.Status ? "1" : "0", "");
                param.SetSPParameterList(spParametersList, "ExecutionType", "2", "");

                dTable = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList);

                // Count Data
                ParameterSet param1 = new ParameterSet();
                var spParametersList1 = new List<SPParameter>();
                param1.SetSPParameterList(spParametersList1, "BusinessUnit", selected.BusinessUnit.ToString(), "");
                param1.SetSPParameterList(spParametersList1, "ReturnType", selected.RetnType ?? "", "");
                param1.SetSPParameterList(spParametersList1, "Description", selected.Description ?? "", "");
                param1.SetSPParameterList(spParametersList1, "ModuleCode", selected.ModuleCode ?? "", "");
                param1.SetSPParameterList(spParametersList1, "ModuleCodeDesc", selected.ModuleCodeDesc ?? "", "");
                param1.SetSPParameterList(spParametersList1, "Status", selected.Status ? "1" : "0", "");
                param1.SetSPParameterList(spParametersList1, "ExecutionType", "3", "");

                DataTable tempDt = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList1);
                if (tempDt.Rows.Count > 0 && tempDt.Rows[0]["TotalRows"] != DBNull.Value)
                {
                    rowCount = int.Parse(tempDt.Rows[0]["TotalRows"].ToString());
                }
            }
            catch (Exception e)
            {
                msg = MessageCreate.CreateErrorMessage(0, e, "GetGridData", "XONT.VENTURA.SOMNT24.dll");
            }
            finally
            {
                dbService.CloseService();
            }
            return dTable;
        }

        public DataTable GetModulePromptData(string businessUnit, ref MessageSet msg)
        {
            try
            {
                dbService.StartService();
                ParameterSet param = new ParameterSet();
                var spParametersList = new List<SPParameter>();
                param.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
                param.SetSPParameterList(spParametersList, "ExecutionType", "1", "");
                dTable = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList);
            }
            catch (Exception e)
            {
                msg = MessageCreate.CreateErrorMessage(0, e, "GetModulePromptData", "XONT.VENTURA.SOMNT24.DLL");
            }
            finally
            {
                dbService.CloseService();
            }
            return dTable;
        }

        public DataTable GetModulePromptDataForNew(string businessUnit, ref MessageSet msg)
        {
            try
            {
                dbService.StartService();
                ParameterSet param = new ParameterSet();
                var spParametersList = new List<SPParameter>();
                param.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
                param.SetSPParameterList(spParametersList, "ExecutionType", "4", "");
                dTable = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList);
            }
            catch (Exception e)
            {
                msg = MessageCreate.CreateErrorMessage(0, e, "GetModulePromptDataForNew", "XONT.VENTURA.SOMNT24.DLL");
            }
            finally
            {
                dbService.CloseService();
            }
            return dTable;
        }

        public DataTable GetCategoryPromptData(string businessUnit, ref MessageSet msg)
        {
            try
            {
                dbService.StartService();
                ParameterSet param = new ParameterSet();
                var spParametersList = new List<SPParameter>();
                param.SetSPParameterList(spParametersList, "BusinessUnit", businessUnit, "");
                param.SetSPParameterList(spParametersList, "ExecutionType", "5", "");
                dTable = dbService.FillDataTable(CommonVar.DBConName.UserDB, "[RD].[usp_SOMNT24GetAllData]", spParametersList);
            }
            catch (Exception e)
            {
                msg = MessageCreate.CreateErrorMessage(0, e, "GetCategoryPromptData", "XONT.VENTURA.SOMNT24.DLL");
            }
            finally
            {
                dbService.CloseService();
            }
            return dTable;
        }
    }
}