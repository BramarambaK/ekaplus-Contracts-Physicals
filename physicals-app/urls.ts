import { Injectable } from '@angular/core';
import { EnvConfig } from '@eka-framework/core';

@Injectable()
export class Urls {
  constructor() { }

  public static get CTRM_SAVE() {
    return '/contract' + '/contract';
  }
  public static get GET_CONTRACT_CTRM() {
    return '/contract' + '/contract';
  }
  public static get SAVE_EDITED_CONTRACT() {
    return '/contract' + '/contract';
  }
  public static get CREATE_CONTRACT_ID_URL() {
    return '/contract' + '/generate/id';
  }

  public static get CREATE_CONTRACT_AUTOSAVE_URL() {
    return (
      '/contract' +
      '/contract/draft/autosave/initial'
    );
  }

  public static get CONTRACT_AUTOSAVE_URL() {
    return (
      '/contract' + '/contract/draft/autosave'
    );
  }

  public static get GET_CP_ADDRESS() {
    return '/contract' + '/contract/cp';
  }

  public static get UPDATE_CTRM_DRAFT() {
    return '/contract' + '/contract/draft';
  }
  public static get CTRM_DRAFT_URL() {
    return '/contract' + '/contract/draft';
  }
  public static get TEMPLATE_SAVE_URL() {
    return '/contract' + '/contract/template';
  }
  public static get GET_TEMPLATE_DATA() {
    return '/contract' + '/contract/template';
  }

  public static get CONTRACT_META_URL() {
    return `/meta/object/contract`;
  }
  public static get CONTRACT_CONNECT_DATA_URL() {
    return `/data/${EnvConfig.vars.app_uuid}/contract`;
  }

  public static get GET_FORMULA_URL() {
    return '/data/Pricing/Formula/';
  }

  public static get MDM_URL() {
    //return EnvConfig.vars.eka_mdm_host + `/mdm/${EnvConfig.vars.app_uuid}/data`;
    return `/workflow/mdm`
  }

  public static get MDM_URL_Qual() {
    return EnvConfig.vars.eka_mdm_host + `/mdm/product/quality/${EnvConfig.vars.app_uuid}/`;
  }

  // public static get DocumentUpload() {
  //   return EnvConfig.vars.Upload_URL + '/file/upload';
  // }

  public static get GET_APPROVER_LIST() {
    return '/contract' + '/contract/approval';
  }
  public static get GET_PENDING_APPROVERS() {
    return (
      '/contract' + '/contract/approval/contract'
    );
  }
  public static get APPROVER_REJECT() {
    return (
      '/contract' + '/contract/approval/manage'
    );
  }

  public static get CTRM_CONTRACT_LIST_URL() {
    return '/trm/#gridId/LOC';
  }
  public static get CTRM_TEMPLATE_LIST_URL() {
    return '/trm/#gridId/LOT';
  }
  public static get CTRM_DRAFT_LIST_URL() {
    return '/trm/#gridId/LODT';
  }
  public static get TRM_HOME_URL() {
    return '/trm/#home/Physicals';
  }
  public static get CTRM_PRINTABLE_TEMPLATE_URL() {
    return (
      '/app/contractOrderStatus.do?method=getContractOrderStatusdetails&internalContractRefNo='
    );
  }

  public static get CHANGE_DATA_TRACKER() {
    return `/data/${EnvConfig.vars.app_uuid}/contract_change`;
  }

  public static get UTILITY_SERVICE_SERVER() {
    return EnvConfig.vars.eka_utility_host;
  }

  public static get ID2VALUE() {
    //return EnvConfig.vars.eka_mdm_host + `/mdm/id2value/object/${EnvConfig.vars.app_uuid}/contract`;
    return `/workflow`
  }

  public static get RECOMMENDATION_GENERAL_DEATAILS() {
   // return EnvConfig.vars.eka_recommendation_host + '/get-recommendation?itemsection=FALSE';
   return `/workflow/recommendation`
  }

  public static get RECOMMENDATION_ITEM_DETAILS() {
    //return EnvConfig.vars.eka_recommendation_host + '/get-recommendation?itemsection=TRUE';
    return `/workflow/recommendation`
  }

  public static get TEXT_TO_FORM() {
    //return EnvConfig.vars.eka_textToForm_host + '/nlp/processSentence?sentence=';
    return '/workflow/nlp?sentence=';
  }

  public static get USER_CONTEXT() {
    return '/contract' + '/user/data';
  }

  public static get LAST_AUTOSAVE_CONTRACT_URL() {
    return '/contract' + '/contract/latest';
  }

}
