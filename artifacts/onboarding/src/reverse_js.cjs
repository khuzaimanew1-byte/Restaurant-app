const fs = require('fs');
const path = require('path');

const explicitMap = {
  // components
  'AdminDashboard': 'AdmDsh',
  'AddEmployeePage': 'AddEmp',
  'LoginFlow': 'LogFlw',
  'WelcomeFlow': 'WelFlw',
  'ResetPasswordScreen': 'ResPwd',
  'SignInScreen': 'LogScr',
  'OtpScreen': 'OtpScr',
  'WelcomeBg': 'WelBg',
  'AuthBg': 'AutBg',
  'StatusTag': 'StsTag',
  'Navigation': 'NavBar',
  'BulletList': 'BulLst',
  'PasswordRules': 'PwdRul',
  'PasswordInput': 'PwdInp',
  'EmployeeCard': 'EmpCrd',
  'OfficeTimingHeader': 'OffTim',
  'LogoutModal': 'LogOut',
  'RestaurantLogo': 'RstLog',
  'AvatarImg': 'AvtImg',
  'ProgressBar': 'PrgBar',
  'Highlight': 'Hglght',
  // hooks
  'useCreateEmployee': 'useAdd',
  'useUpdateEmployeeStatus': 'useUpd',
  'useEmployees': 'useEmp',
  'useDelayedUnmount': 'useDel',
  'useDebounce': 'useDeb',
  // functions
  'getValidToken': 'getTok',
  'getInitialView': 'getInV',
  'handleResetVerified': 'onResV',
  'leaveNewPassword': 'onLvPw',
  'handleLogout': 'onLogO',
  'applyImageFile': 'setImg',
  'handleCreate': 'onAddE',
  'handleSalaryInput': 'onSal',
  'handlePhone': 'onPhn',
  'handleCnic': 'onCnic',
  'handleCancel': 'onCncl',
  'scheduleDraftSave': 'svDrft',
  'readDraft': 'getDrf',
  'getArrivalStatus': 'getArr',
  'getDepartureStatus': 'getDep',
  'getDisplayStatus': 'getSts',
  'canAssignHalfDay': 'canHlf',
  'sortedEmployees': 'srtEmp',
  'getTodayStr': 'getTdy',
  'normSalary': 'nrmSal',
  'parseTimeMins': 'prsTim',
  'handleInlineSave': 'onInSv',
  'handleTouchStart': 'onTchS',
  'handleContextMenu': 'onCtxM',
  'moveFocus': 'movFoc',
  'handleCtxAction': 'onCtxA',
  'handleEditSave': 'onEdSv',
  'openSearch': 'opnSrc',
  'closeSearch': 'clsSrc',
  'handleLogin': 'onLgin',
  'handleVerify': 'onVrfy',
  'handleReset': 'onRset',
  'handleForgot': 'onFgt',
  'handleBackToSignin': 'onBkSg',
  'handleResend': 'onRsnd',
  'handleLoggedIn': 'onLgIn',
  'handleOtpNeeded': 'onOtpN',
  'handleResetReady': 'onRsRd',
  'triggerShake': 'trgShk',
  'handleChange': 'onChg',
  'handleKeyDown': 'onKeyD',
  'handlePaste': 'onPst',
  'parseResponse': 'prsRes',
  // vars
  'createMutation': 'addMut',
  'updateMutation': 'updMut',
  'mobileSearchOpen': 'mobSrc',
  'logoutModalOpen': 'logMod',
  'debouncedQuery': 'debQry',
  'mobileSearchRef': 'mobRef',
  'presentCount': 'preCnt',
  'halfDayCount': 'hlfCnt',
  'totalCount': 'totCnt',
  'sharedCardProps': 'crdPrp',
  'shouldRenderLogout': 'rndLog',
  'shouldRenderCtx': 'rndCtx',
  'shouldRenderDropdown': 'rndDrp',
  'ctxMenuDataRef': 'ctxRef',
  'ctxMenuData': 'ctxDat',
  'itemDisabled': 'itmDis',
  'enabledIdxs': 'enaIdx',
  'kbdIdxRef': 'kbdRef',
  'draftTimerRef': 'drfTmr',
  'toastTimerRef': 'tstTmr',
  'toastShow': 'tstShw',
  'shiftStartRef': 'sftStR',
  'shiftEndRef': 'sftEnR',
  'joiningRef': 'joinRf',
  'expYrRef': 'expYRf',
  'salInpRef': 'salInR',
  'salSizerRef': 'salSzR',
  'genderOpen': 'genOpn',
  'langInput': 'lngInp',
  'avatarUrl': 'avtUrl',
  'dragOver': 'drgOvr',
  'shiftStart': 'sftStr',
  'shiftEnd': 'sftEnd',
  'emailRef': 'emlRef',
  'expiresAtFromWait': 'expWt',
  'secsRemaining': 'secRem',
  'isPwValid': 'pwVld',
  'showRules': 'shwRul',
  'isPending': 'isPend',
  'isLeave': 'isLeav',
  'isLogin': 'isLgin',
  'editError': 'edtErr',
  'shouldPulse': 'shdPls',
  'statusCss': 'stsCss',
  'displayIn': 'dspIn',
  'displayOut': 'dspOut',
  'prevented': 'prvnt',
  'timerRef': 'tmrRef',
  'clearTimer': 'clrTmr',
  'uiStatusToDb': 'ui2Db',
  'updateEmployeeStatus': 'updSts',
  'fetchEmployees': 'fchEmp',
  'CreateEmployeePayload': 'EmpPay',
  'EmployeeCard': 'EmpCrd',
  'OfficeTiming': 'OffTim',
  'DisplayStatus': 'DspSts',
  'guardedView': 'grdViw',
  'viewClass': 'viwCls',
  'resetToken': 'rstTok',
  'AUTH_KEY': 'AUT_KY',
  'SESSION_KEY': 'SES_KY',
  'EMPLOYEES_KEY': 'EMP_KY',
  'STATUS_CSS': 'STS_CS',
  'STATUS_LABEL': 'STS_LB',
  'SORT_NO_CHECKOUT': 'SRT_NO',
  'SORT_WITH_CHECKOUT': 'SRT_WI',
  'GENDERS': 'GENDRS',
  'WEEK_DAYS': 'WK_DYS',
  'MONTH_DAYS': 'MO_DYS',
  'LEAVE_DAYS': 'LV_DYS',
  'NAV_ITEMS': 'NAV_IT',
  // SVG
  'PersonSVG': 'PrsSVG',
  'CardSVG': 'CrdSVG',
  'PhoneSVG': 'PhnSVG',
  'MailSVG': 'MalSVG',
  'GlobeSVG': 'GlbSVG',
  'BriefSVG': 'BrfSVG',
  'PinSVG': 'PinSVG',
  'UsersSVG': 'UsrSVG',
  'CalSVG': 'CalSVG',
  'CameraSVG': 'CamSVG',
  'CameraSmSVG': 'CsmSVG',
  'ChevSVG': 'ChvSVG',
  'EyeIcon': 'EyeIco',
  'EyeOffIcon': 'EyOIco',
  'LockIcon': 'LckIco',
  'MailIcon': 'MalIco',
  'TrashSVG': 'TrsSVG',
  'NavIcon': 'NavIco',
  'LeaveIllus': 'LevIll',
  // CSS classes mapped via code
  'illusCls': 'illCls',
  'textCls': 'txtCls'
};

const reverseMap = {};
for (let k in explicitMap) {
  reverseMap[explicitMap[k]] = k;
}

const processed = new Set();

function replaceInFile(fp) {
  let c = fs.readFileSync(fp, 'utf8');
  let newC = c;
  
  for (let k of Object.keys(reverseMap).sort((a,b) => b.length - a.length)) {
    let v = reverseMap[k];
    let re = new RegExp(`(?<![a-zA-Z0-9_$])` + k + `(?![a-zA-Z0-9_$])`, 'g');
    newC = newC.replace(re, v);
  }
  
  if (newC !== c) {
    fs.writeFileSync(fp, newC, 'utf8');
    processed.add(fp);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fp = path.join(dir, file);
    if (fs.statSync(fp).isDirectory()) {
      walk(fp);
    } else if (fp.endsWith('.tsx') || fp.endsWith('.ts')) {
      replaceInFile(fp);
    }
  });
}

walk(__dirname);
console.log(`Reverted ${processed.size} files.`);
