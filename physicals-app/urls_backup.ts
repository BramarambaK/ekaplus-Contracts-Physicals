import { EnvConfig } from '@eka-framework/core';

export class Urls {
  public static CTRM_SAVE =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract';
  public static GET_CONTRACT_CTRM =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/';
  public static SAVE_EDITED_CONTRACT =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract';
  public static CREATE_CONTRACT_ID_URL =
    EnvConfig.vars.eka_trm_physicals_api_host + '/generate/id';
  public static SAVE_DRAFT_URL =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/draft/autosave/';
  public static GET_DRAFT_URL =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/draft/autosave/';
  public static UPDATE_CTRM_DRAFT =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/draft';
  public static CTRM_DRAFT_URL =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/draft';
  public static TEMPLATE_SAVE_URL =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/template';
  public static GET_TEMPLATE_DATA =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/template/';

  public static CONTRACT_META_URL =
    EnvConfig.vars.CONNECT + '/meta/object/Contract_int';
  public static GET_FORMULA_URL =
    EnvConfig.vars.CONNECT + '/data/Pricing/Formula/';

  public static MDM_URL = EnvConfig.vars.eka_mdm_host + '/mdm/data';

  public static GET_APPROVER_LIST =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/approval/New';
  public static GET_PENDING_APPROVERS =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/approval/PENDING/';
  public static APPROVER_REJECT =
    EnvConfig.vars.eka_trm_physicals_api_host + '/contract/approval/manage/';

  //let savedCredentials = localStorage.getItem('credentials');
  //let credentials = JSON.parse(savedCredentials);
  public static CTRM_CONTRACT_LIST_URL =
    EnvConfig.vars.ctrm_url +
    '/ekaApp/login?partnerApp=' +
    EnvConfig.vars.ctrm_url +
    '/login.do?method=login&redirectpage=/app/commonListing.do?method=getCommonListingPage&gridId=LOC&applyDefaultValue=Y&Authorization=';
  public static CTRM_TEMPLATE_LIST_URL =
    EnvConfig.vars.ctrm_url +
    '/ekaApp/login?partnerApp=' +
    EnvConfig.vars.ctrm_url +
    '/login.do?method=login&redirectpage=/app/commonListing.do?method=getCommonListingPage&gridId=LOT&Authorization=';
  public static CTRM_DRAFT_LIST_URL =
    EnvConfig.vars.ctrm_url +
    '/ekaApp/login?partnerApp=' +
    EnvConfig.vars.ctrm_url +
    '/login.do?method=login&redirectpage=/app/commonListing.do?method=getCommonListingPage&gridId=LOD&applyDefaultValue=Y&Authorization=';
  public static CTRM_PRINTABLE_TEMPLATE_URL =
    EnvConfig.vars.ctrm_url +
    '/app/contractOrderStatus.do?method=getContractOrderStatusdetails&internalContractRefNo=';

  public static CHANGE_DATA_TRACKER =
    EnvConfig.vars.CONNECT + '/data/physicals/contract_change';
}
