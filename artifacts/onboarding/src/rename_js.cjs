const fs = require('fs');
const path = require('path');

const exceptions = new Set([
  'import', 'export', 'default', 'return', 'function', 'const', 'let', 'var', 'class',
  'interface', 'type', 'extends', 'implements', 'async', 'await', 'switch', 'case',
  'break', 'continue', 'if', 'else', 'for', 'while', 'do', 'try', 'catch', 'finally',
  'throw', 'typeof', 'instanceof', 'void', 'null', 'undefined', 'true', 'false',
  'window', 'document', 'console', 'localStorage', 'sessionStorage', 'navigator',
  'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'requestAnimationFrame',
  'Promise', 'Math', 'Date', 'JSON', 'Object', 'Array', 'String', 'Number', 'Boolean',
  'RegExp', 'Map', 'Set', 'Error', 'URL', 'URLSearchParams', 'FormData', 'Blob', 'File',
  'FileReader', 'Image', 'CanvasRenderingContext2D', 'HTMLInputElement', 'HTMLDivElement',
  'HTMLSpanElement', 'HTMLButtonElement', 'HTMLElement', 'SVGElement', 'React',
  'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useLayoutEffect',
  'useContext', 'useReducer', 'Suspense', 'lazy', 'memo', 'createRoot',
  'QueryClient', 'QueryClientProvider', 'useQuery', 'useMutation',
  'length', 'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'concat', 'join',
  'indexOf', 'lastIndexOf', 'includes', 'find', 'findIndex', 'filter', 'map', 'reduce',
  'reduceRight', 'some', 'every', 'sort', 'reverse', 'split', 'replace', 'match',
  'matchAll', 'search', 'substring', 'substr', 'charAt', 'charCodeAt', 'toLowerCase',
  'toUpperCase', 'trim', 'trimStart', 'trimEnd', 'padStart', 'padEnd', 'startsWith',
  'endsWith', 'repeat', 'keys', 'values', 'entries', 'hasOwnProperty', 'toString',
  'toLocaleString', 'valueOf', 'parseInt', 'parseFloat', 'isNaN', 'isFinite',
  'getElementById', 'querySelector', 'querySelectorAll', 'createElement', 'appendChild',
  'removeChild', 'replaceChild', 'insertBefore', 'addEventListener', 'removeEventListener',
  'stopPropagation', 'preventDefault', 'clientX', 'clientY', 'touches', 'target',
  'current', 'className', 'style', 'width', 'height', 'top', 'left', 'right', 'bottom',
  'margin', 'padding', 'border', 'background', 'color', 'font', 'text', 'line',
  'display', 'position', 'overflow', 'visibility', 'opacity', 'zIndex', 'transform',
  'transition', 'animation', 'boxShadow', 'textShadow', 'cursor', 'pointerEvents',
  'userSelect', 'whiteSpace', 'wordBreak', 'wordWrap', 'textOverflow', 'stroke',
  'strokeWidth', 'strokeLinecap', 'strokeLinejoin', 'fill', 'cx', 'cy', 'r', 'x', 'y',
  'x1', 'y1', 'x2', 'y2', 'points', 'd', 'viewBox', 'xmlns', 'children',
  'onChange', 'onClick', 'onSubmit', 'onKeyDown', 'onKeyUp', 'onKeyPress', 'onFocus',
  'onBlur', 'onMouseEnter', 'onMouseLeave', 'onMouseOver', 'onMouseOut', 'onMouseMove',
  'onMouseDown', 'onMouseUp', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel',
  'onDragStart', 'onDrag', 'onDragEnd', 'onDragEnter', 'onDragLeave', 'onDragOver', 'onDrop',
  'aria-hidden', 'aria-label', 'aria-checked', 'role', 'tabIndex', 'autoComplete',
  'inputMode', 'placeholder', 'disabled', 'checked', 'value', 'type', 'name', 'id',
  'htmlFor', 'className', 'style', 'key', 'ref', 'src', 'alt', 'href', 'target', 'rel',
  'title', 'action', 'method', 'enctype', 'accept', 'multiple', 'min', 'max', 'step',
  'pattern', 'required', 'readOnly', 'maxLength', 'minLength', 'size', 'rows', 'cols',
  'wrap', 'form', 'formAction', 'formMethod', 'formEnctype', 'formTarget', 'formNoValidate',
  'dataTransfer', 'files', 'createObjectURL', 'revokeObjectURL', 'drawImage',
  'getContext', 'toDataURL', 'getItem', 'setItem', 'removeItem', 'clear', 'parse',
  'stringify', 'atob', 'btoa', 'split', 'startsWith', 'replaceState', 'pushState',
  'pathname', 'location', 'history', 'match', 'max', 'min', 'parseInt', 'Date',
  'now', 'fallback', 'initialSlide', 'onSlideChange', 'onGetStarted', 'onLoggedIn',
  'onResetVerified', 'onBack', 'onDone', 'onLogout', 'onAddEmployee', 'isOpen', 'onClose',
  'autoFocus', 'loading', 'onError', 'onCtxMenu', 'onLongPress', 'onEditSave', 'onAction',
  'onUpdate', 'onConfirm', 'onCancel', 'onQueryChange', 'onOpenSearch', 'onCloseSearch',
  'onLogoutRequest', 'onNavChange', 'onAdd', 'onDelete', 'onInputChange', 'staleTime',
  'retry', 'defaultOptions', 'queries', 'mutations', 'client', 'render', 'document',
  'getElementById', 'createRoot', 'QueryClient', 'QueryClientProvider', 'App', 'index'
]);

const shortMap = {};
let counter = 1000;

function generateShort(name) {
  if (name.length <= 6) return name;
  if (name.startsWith('use')) {
    let suffix = name.slice(3).replace(/[a-z]/g, '').toLowerCase();
    let res = ('use' + suffix).substring(0, 6);
    if (res.length < 4) res = 'use' + name.slice(3, 6).toLowerCase();
    return res;
  }
  let p = name.replace(/([A-Z])/g, '-$1').toLowerCase().split(/[-_]+/).filter(Boolean);
  let res = p[0].substring(0, 3) + (p[1] ? p[1].substring(0, 3) : '');
  // pascal case restore if original was PascalCase
  if (/^[A-Z]/.test(name)) {
    res = res.charAt(0).toUpperCase() + res.slice(1);
  }
  if (res.length > 6) res = res.substring(0, 6);
  return res;
}

// Manually specify exact renames for absolute predictability
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

const processed = new Set();

function replaceInFile(fp) {
  let c = fs.readFileSync(fp, 'utf8');
  let newC = c;
  
  for (let k of Object.keys(explicitMap).sort((a,b) => b.length - a.length)) {
    let v = explicitMap[k];
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
console.log(`Updated ${processed.size} files.`);
