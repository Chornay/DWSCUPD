// @flow

import color from 'color';
import { Platform, Dimensions, PixelRatio } from 'react-native';

import { PLATFORM } from './commonColor';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
const platform = Platform.OS;
const platformStyle = PLATFORM.MATERIAL;
const isIphoneX =
  platform === PLATFORM.IOS &&
  (deviceHeight === 812 ||
    deviceWidth === 812 ||
    deviceHeight === 896 ||
    deviceWidth === 896);

const DWcolorTheme = 'white';
const DWcolorText = 'grey'
const DWcolorTextHi = 'black'
const DWcolorHeaderSec = '#5ac0f9'
const DWheaderBkColor = DWcolorTheme
const DWfooterBkColor = DWcolorTheme
const DWheaderTextColor = DWcolorTextHi
const DWheaderTitleFontSize = 24
const DWheaderSubtitleFontSize = 14
const DWspinnerColor = DWcolorTextHi

export default {
  platformStyle,
  platform,

  // Accordion
  headerStyle: '#edebed',
  iconStyle: '#000',
  contentStyle: '#f5f4f5',
  expandedIconStyle: '#000',
  accordionBorderColor: '#d3d3d3',

  // ActionSheet
  elevation: 4,
  containerTouchableBackgroundColor: 'rgba(0,0,0,0.4)',
  innerTouchableBackgroundColor: '#fff',
  listItemHeight: 50,
  listItemBorderColor: 'transparent',
  marginHorizontal: -15,
  marginLeft: 14,
  marginTop: 15,
  minHeight: 56,
  padding: 15,
  touchableTextColor: '#757575',

  // Android
  androidRipple: true,
  androidRippleColor: 'rgba(256, 256, 256, 0.3)',
  androidRippleColorDark: 'rgba(0, 0, 0, 0.15)',
  buttonUppercaseAndroidText: true,

  // Badge
  badgeBg: '#ED1727',
  badgeColor: '#fff',
  badgePadding: 0,

  // Button
  // buttonFontFamily: 'Roboto', //DEBUG
  buttonFontFamily: platform === PLATFORM.IOS ? 'System' : 'Roboto',

  buttonDisabledBg: '#b5b5b5',
  buttonPadding: 6,
  get buttonPrimaryBg() {
    return this.brandPrimary;
  },
  get buttonPrimaryColor() {
    return this.inverseTextColor;
  },
  get buttonInfoBg() {
    return this.brandInfo;
  },
  get buttonInfoColor() {
    return this.inverseTextColor;
  },
  get buttonSuccessBg() {
    return this.brandSuccess;
  },
  get buttonSuccessColor() {
    return this.inverseTextColor;
  },
  get buttonDangerBg() {
    return this.brandDanger;
  },
  get buttonDangerColor() {
    return this.inverseTextColor;
  },
  get buttonWarningBg() {
    return this.brandWarning;
  },
  get buttonWarningColor() {
    return this.inverseTextColor;
  },
  get buttonTextSize() {
    return this.fontSizeBase - 1;
  },
  get buttonTextSizeLarge() {
    return this.fontSizeBase * 1.5;
  },
  get buttonTextSizeSmall() {
    return this.fontSizeBase * 0.8;
  },
  get borderRadiusLarge() {
    return this.fontSizeBase * 3.8;
  },
  get iconSizeLarge() {
    return this.iconFontSize * 1.5;
  },
  get iconSizeSmall() {
    return this.iconFontSize * 0.6;
  },

  // Card
  cardDefaultBg: '#fff',
  cardBorderColor: '#ccc',
  cardBorderRadius: 2,
  cardItemPadding: platform === PLATFORM.IOS ? 10 : 12,

  // CheckBox
  CheckboxRadius: 400 / 2,
  CheckboxBorderWidth: 1,
  CheckboxPaddingLeft: 0,
  CheckboxPaddingBottom: 5,
  CheckboxIconSize: 14,
  CheckboxIconMarginTop: 6,
  CheckboxIconMarginTop: 2,//DEBUD 20220826
  // CheckboxFontSize: 14, //DEBUD 20220826
  CheckboxFontSize: 16,
  // checkboxBgColor: '#039BE5', //DEBUG
  // checkboxBgColor: 'transparent', //DEBUG 20220914 GC will not get the change 
  checkboxBgColor: '#9cd5f9', 
  checkboxSize: 20,
  // checkboxTickColor: '#fff', //DEBUG 
  // checkboxTickColor: '#9cd5f9',
  checkboxTickColor: '#ffff',//DEBUG 20220914 GC will not get the change
  checkboxDefaultColor: "transparent",

  // Color
  brandPrimary: '#3F51B5',
  brandInfo: '#62B1F6',
  brandSuccess: '#5cb85c',
  brandDanger: '#d9534f',
  brandWarning: '#f0ad4e',
  brandDark: '#000',
  brandLight: '#f4f4f4',

  // Container
  containerBgColor: '#fff',

  // Date Picker
  datePickerTextColor: '#000',
  datePickerBg: 'transparent',

  // FAB
  fabWidth: 56,

  // Font
  DefaultFontSize: 16,
  // fontFamily: 'Roboto', //DEBUG
  
  // fontFamily: platform === PLATFORM.IOS ? 'System' : 'Roboto',
  fontFamily: platform === PLATFORM.IOS ? 'System' : 'sans-serif-medium', //DEBU
  fontSizeBase: 15,
  get fontSizeH1() {
    return this.fontSizeBase * 1.8;
  },
  get fontSizeH2() {
    return this.fontSizeBase * 1.6;
  },
  get fontSizeH3() {
    return this.fontSizeBase * 1.4;
  },

  // Footer
  footerHeight: 55,
  footerDefaultBg: DWfooterBkColor, //DW footerDefaultBg: '#3F51B5',
  footerPaddingBottom: 0,

  // FooterTab
  tabBarTextColor: '#bfc6ea',
  tabBarTextSize: 11,
  activeTab: '#007aff', //DW activeTab: '#007aff', 
  sTabBarActiveTextColor: '#007aff', //DW sTabBarActiveTextColor: '#007aff',
  tabBarActiveTextColor: '#5ac0f9', //DW tabBarActiveTextColor: '#fff',
  tabActiveBgColor: '#fff', //DW tabActiveBgColor: '#3F51B5',

  // // Header
  // toolbarBtnColor: '#fff',
  // toolbarDefaultBg: DWheaderBkColor,  //DW  toolbarDefaultBg: '#3F51B5',
  // toolbarHeight: 56,
  // toolbarSearchIconSize: 23,
  // toolbarInputColor: '#fff',
  // searchBarHeight: platform === PLATFORM.IOS ? 30 : 40,
  // searchBarInputHeight: platform === PLATFORM.IOS ? 40 : 50,
  // toolbarBtnTextColor: '#fff',
  // toolbarDefaultBorder: '#3F51B5',
  // iosStatusbar: 'light-content',
  // get statusBarColor() {
  //   return color(this.toolbarDefaultBg)
  //     //DW don't want to darken      .darken(0.2)
  //     .hex();
  // },
  // get darkenHeader() {
  //   return color(this.tabBgColor)
  //     .darken(0.03)
  //     .hex();
  // },
  
// Header
toolbarBtnColor: '#fff',
toolbarDefaultBg: DWcolorHeaderSec,  //DW  toolbarDefaultBg: '#3F51B5', this is statusbar bk
toolbarHeight: 56,
toolbarSearchIconSize: 23,
toolbarInputColor: '#fff', 
searchBarHeight: platform === PLATFORM.IOS ? 30 : 40,
searchBarInputHeight: platform === PLATFORM.IOS ? 40 : 50,
// toolbarBtnTextColor: '#fff', xxxxxxx
toolbarBtnTextColor: '#fff',
toolbarDefaultBorder: '#3F51B5',
iosStatusbar: 'dark-content',
get statusBarColor() {
  return color(this.toolbarDefaultBg)
    //DW don't want to darken      .darken(0.2)
    .hex();
},
get darkenHeader() {
  return color(this.tabBgColor)
    .darken(0.03)
    .hex();
},

  // Icon
  iconFamily: 'Ionicons', //DEBUG
  // iconFamily: 'System',
  iconFontSize: 28,
  iconHeaderSize: 24,

  // InputGroup
  inputFontSize: 17,
  inputBorderColor: '#D9D5DC',
  inputSuccessBorderColor: '#2b8339',
  inputErrorBorderColor: '#ed2f2f',
  inputHeightBase: 50,
  get inputColor() {
    return this.textColor;
  },
  get inputColorPlaceholder() {
    return '#575757';
  },

  // Line Height
  buttonLineHeight: 19,
  lineHeightH1: 32,
  lineHeightH2: 27,
  lineHeightH3: 22,
  lineHeight: 24,

  // List
  listBg: 'transparent',
  listBorderColor: '#c9c9c9',
  listDividerBg: '#f4f4f4',
  listBtnUnderlayColor: '#DDD',
  listItemPadding: 1,
  listNoteColor: '#808080',
  listNoteSize: 13,
  listItemSelected: '#3F51B5',

  // Progress Bar
  defaultProgressColor: '#E4202D',
  inverseProgressColor: '#1A191B',

  // Radio Button
  radioBtnSize: 23,
  radioSelectedColorAndroid: '#3F51B5',
  radioBtnLineHeight: 24,
  get radioColor() {
    return this.brandPrimary;
  },

  // Segment
  segmentBackgroundColor: '#3F51B5',
  segmentActiveBackgroundColor: '#fff',
  segmentTextColor: '#fff',
  segmentActiveTextColor: '#3F51B5',
  segmentBorderColor: '#fff',
  segmentBorderColorMain: '#3F51B5',

  // Spinner
  defaultSpinnerColor: DWspinnerColor,  //DW defaultSpinnerColor: '#45D56E',
  inverseSpinnerColor: '#1A191B',

  // Tab
  tabDefaultBg: '#3F51B5',
  topTabBarTextColor: '#b3c7f9',
  topTabBarActiveTextColor: '#fff',
  topTabBarBorderColor: '#fff',
  topTabBarActiveBorderColor: '#fff',

  // Tabs
  tabBgColor: '#F8F8F8',
  tabFontSize: 15,

  // Text
  textColor: '#000',
  toolbarBtnTextColor: '#fff',
  noteFontSize: 14,
  get defaultTextColor() {
    return this.textColor;
  },

  // Title
  // titleFontfamily: 'Roboto', //DEBUG
  titleFontfamily: platform === PLATFORM.IOS ? 'System' : 'Roboto',
  titleFontSize: DWheaderTitleFontSize,  //DW titleFontSize: 19,
  subTitleFontSize: DWheaderSubtitleFontSize,        //DW subTitleFontSize: 14,
  subtitleColor: DWheaderTextColor,  //DW subtitleColor: '#FFF',
  titleFontColor: DWheaderTextColor,  // DW titleFontColor: '#FFF',

  // Other
  borderRadiusBase: 2,
  borderWidth: 1 / PixelRatio.getPixelSizeForLayoutSize(1),
  contentPadding: 10,
  dropdownLinkColor: '#414142',
  inputLineHeight: 24,
  deviceWidth,
  deviceHeight,
  isIphoneX,
  inputGroupRoundedBorderRadius: 30,

  // iPhoneX SafeArea
  Inset: {
    portrait: {
      topInset: 24,
      leftInset: 0,
      rightInset: 0,
      bottomInset: 34
    },
    landscape: {
      topInset: 0,
      leftInset: 44,
      rightInset: 44,
      bottomInset: 21
    }
  }
};
