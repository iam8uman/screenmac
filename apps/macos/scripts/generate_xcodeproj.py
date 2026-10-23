#!/usr/bin/env python3
"""Generate apps/macos/Screenmac.xcodeproj.

The project uses Xcode 16 folder-synchronized groups, so every file under
Screenmac/ and ScreenmacTests/ is included automatically. Re-run this script
only to change build settings or targets:

    python3 apps/macos/scripts/generate_xcodeproj.py
"""
from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[1]
PROJ = ROOT / "Screenmac.xcodeproj"


def oid(name: str) -> str:
    return hashlib.sha1(name.encode()).hexdigest()[:24].upper()


I = {k: oid(k) for k in [
    "project", "mainGroup", "productsGroup", "appGroup", "testGroup",
    "appTarget", "testTarget", "appProduct", "testProduct",
    "appSources", "appFrameworks", "appResources", "testSources", "testFrameworks", "testResources",
    "proxy", "dependency",
    "projList", "projDebug", "projRelease", "appList", "appDebug", "appRelease", "testList", "testDebug", "testRelease",
]}


def settings(d: dict) -> str:
    lines = []
    for k in sorted(d):
        v = d[k]
        if isinstance(v, list):
            items = "".join(f"\t\t\t\t\t{x},\n" for x in v)
            lines.append(f"\t\t\t\t{k} = (\n{items}\t\t\t\t);")
        else:
            lines.append(f"\t\t\t\t{k} = {v};")
    return "\n".join(lines)


COMMON = {
    "ALWAYS_SEARCH_USER_PATHS": "NO",
    "ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS": "YES",
    "CLANG_ANALYZER_NONNULL": "YES",
    "CLANG_ENABLE_MODULES": "YES",
    "CLANG_ENABLE_OBJC_ARC": "YES",
    "COPY_PHASE_STRIP": "NO",
    "ENABLE_STRICT_OBJC_MSGSEND": "YES",
    "ENABLE_USER_SCRIPT_SANDBOXING": "YES",
    "GCC_C_LANGUAGE_STANDARD": "gnu17",
    "GCC_NO_COMMON_BLOCKS": "YES",
    "LOCALIZATION_PREFERS_STRING_CATALOGS": "YES",
    "MACOSX_DEPLOYMENT_TARGET": "14.0",
    "SDKROOT": "macosx",
    "SWIFT_VERSION": "5.0",
}
DEBUG = {**COMMON,
    "DEBUG_INFORMATION_FORMAT": "dwarf",
    "ENABLE_TESTABILITY": "YES",
    "GCC_OPTIMIZATION_LEVEL": "0",
    "GCC_PREPROCESSOR_DEFINITIONS": ['"DEBUG=1"', '"$(inherited)"'],
    "MTL_ENABLE_DEBUG_INFO": "INCLUDE_SOURCE",
    "ONLY_ACTIVE_ARCH": "YES",
    "SWIFT_ACTIVE_COMPILATION_CONDITIONS": '"DEBUG $(inherited)"',
    "SWIFT_OPTIMIZATION_LEVEL": '"-Onone"',
}
RELEASE = {**COMMON,
    "DEBUG_INFORMATION_FORMAT": '"dwarf-with-dsym"',
    "ENABLE_NS_ASSERTIONS": "NO",
    "MTL_ENABLE_DEBUG_INFO": "NO",
    "SWIFT_COMPILATION_MODE": "wholemodule",
}
APP = {
    "ASSETCATALOG_COMPILER_APPICON_NAME": "AppIcon",
    "ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME": "AccentColor",
    "CODE_SIGN_ENTITLEMENTS": "Config/Screenmac.entitlements",
    "CODE_SIGN_IDENTITY": '"-"',
    "CODE_SIGN_STYLE": "Automatic",
    "COMBINE_HIDPI_IMAGES": "YES",
    "CURRENT_PROJECT_VERSION": "1",
    "DEVELOPMENT_TEAM": '""',
    "ENABLE_HARDENED_RUNTIME": "YES",
    "ENABLE_PREVIEWS": "NO",
    "GENERATE_INFOPLIST_FILE": "NO",
    "INFOPLIST_FILE": "Config/Info.plist",
    "LD_RUNPATH_SEARCH_PATHS": ['"$(inherited)"', '"@executable_path/../Frameworks"'],
    "MARKETING_VERSION": "0.2.0",
    "PRODUCT_BUNDLE_IDENTIFIER": "app.screenmac.Screenmac",
    "PRODUCT_NAME": '"$(TARGET_NAME)"',
    "SWIFT_EMIT_LOC_STRINGS": "YES",
}
TEST = {
    "BUNDLE_LOADER": '"$(TEST_HOST)"',
    "CODE_SIGN_IDENTITY": '"-"',
    "CODE_SIGN_STYLE": "Automatic",
    "CURRENT_PROJECT_VERSION": "1",
    "DEVELOPMENT_TEAM": '""',
    "GENERATE_INFOPLIST_FILE": "YES",
    "MARKETING_VERSION": "0.2.0",
    "PRODUCT_BUNDLE_IDENTIFIER": "app.screenmac.ScreenmacTests",
    "PRODUCT_NAME": '"$(TARGET_NAME)"',
    "SWIFT_EMIT_LOC_STRINGS": "NO",
    "TEST_HOST": '"$(BUILT_PRODUCTS_DIR)/Screenmac.app/Contents/MacOS/Screenmac"',
}


def config(id_: str, name: str, values: dict) -> str:
    return f"""\t\t{id_} /* {name} */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
{settings(values)}
\t\t\t}};
\t\t\tname = {name};
\t\t}};"""


def phase(id_: str, isa: str, name: str) -> str:
    return f"""\t\t{id_} /* {name} */ = {{
\t\t\tisa = {isa};
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};"""


def config_list(id_: str, comment: str, debug: str, release: str) -> str:
    return f"""\t\t{id_} /* Build configuration list for {comment} */ = {{
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = (
\t\t\t\t{debug} /* Debug */,
\t\t\t\t{release} /* Release */,
\t\t\t);
\t\t\tdefaultConfigurationIsVisible = 0;
\t\t\tdefaultConfigurationName = Release;
\t\t}};"""


pbx = f"""// !$*UTF8*$!
{{
\tarchiveVersion = 1;
\tclasses = {{
\t}};
\tobjectVersion = 77;
\tobjects = {{

/* Begin PBXContainerItemProxy section */
\t\t{I['proxy']} /* PBXContainerItemProxy */ = {{
\t\t\tisa = PBXContainerItemProxy;
\t\t\tcontainerPortal = {I['project']} /* Project object */;
\t\t\tproxyType = 1;
\t\t\tremoteGlobalIDString = {I['appTarget']};
\t\t\tremoteInfo = Screenmac;
\t\t}};
/* End PBXContainerItemProxy section */

/* Begin PBXFileReference section */
\t\t{I['appProduct']} /* Screenmac.app */ = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = Screenmac.app; sourceTree = BUILT_PRODUCTS_DIR; }};
\t\t{I['testProduct']} /* ScreenmacTests.xctest */ = {{isa = PBXFileReference; explicitFileType = wrapper.cfbundle; includeInIndex = 0; path = ScreenmacTests.xctest; sourceTree = BUILT_PRODUCTS_DIR; }};
/* End PBXFileReference section */

/* Begin PBXFileSystemSynchronizedRootGroup section */
\t\t{I['appGroup']} /* Screenmac */ = {{
\t\t\tisa = PBXFileSystemSynchronizedRootGroup;
\t\t\tpath = Screenmac;
\t\t\tsourceTree = "<group>";
\t\t}};
\t\t{I['testGroup']} /* ScreenmacTests */ = {{
\t\t\tisa = PBXFileSystemSynchronizedRootGroup;
\t\t\tpath = ScreenmacTests;
\t\t\tsourceTree = "<group>";
\t\t}};
/* End PBXFileSystemSynchronizedRootGroup section */

/* Begin PBXFrameworksBuildPhase section */
{phase(I['appFrameworks'], 'PBXFrameworksBuildPhase', 'Frameworks')}
{phase(I['testFrameworks'], 'PBXFrameworksBuildPhase', 'Frameworks')}
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
\t\t{I['mainGroup']} = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t{I['appGroup']} /* Screenmac */,
\t\t\t\t{I['testGroup']} /* ScreenmacTests */,
\t\t\t\t{I['productsGroup']} /* Products */,
\t\t\t);
\t\t\tsourceTree = "<group>";
\t\t}};
\t\t{I['productsGroup']} /* Products */ = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t{I['appProduct']} /* Screenmac.app */,
\t\t\t\t{I['testProduct']} /* ScreenmacTests.xctest */,
\t\t\t);
\t\t\tname = Products;
\t\t\tsourceTree = "<group>";
\t\t}};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
\t\t{I['appTarget']} /* Screenmac */ = {{
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = {I['appList']} /* Build configuration list for PBXNativeTarget "Screenmac" */;
\t\t\tbuildPhases = (
\t\t\t\t{I['appSources']} /* Sources */,
\t\t\t\t{I['appFrameworks']} /* Frameworks */,
\t\t\t\t{I['appResources']} /* Resources */,
\t\t\t);
\t\t\tbuildRules = (
\t\t\t);
\t\t\tdependencies = (
\t\t\t);
\t\t\tfileSystemSynchronizedGroups = (
\t\t\t\t{I['appGroup']} /* Screenmac */,
\t\t\t);
\t\t\tname = Screenmac;
\t\t\tpackageProductDependencies = (
\t\t\t);
\t\t\tproductName = Screenmac;
\t\t\tproductReference = {I['appProduct']} /* Screenmac.app */;
\t\t\tproductType = "com.apple.product-type.application";
\t\t}};
\t\t{I['testTarget']} /* ScreenmacTests */ = {{
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = {I['testList']} /* Build configuration list for PBXNativeTarget "ScreenmacTests" */;
\t\t\tbuildPhases = (
\t\t\t\t{I['testSources']} /* Sources */,
\t\t\t\t{I['testFrameworks']} /* Frameworks */,
\t\t\t\t{I['testResources']} /* Resources */,
\t\t\t);
\t\t\tbuildRules = (
\t\t\t);
\t\t\tdependencies = (
\t\t\t\t{I['dependency']} /* PBXTargetDependency */,
\t\t\t);
\t\t\tfileSystemSynchronizedGroups = (
\t\t\t\t{I['testGroup']} /* ScreenmacTests */,
\t\t\t);
\t\t\tname = ScreenmacTests;
\t\t\tpackageProductDependencies = (
\t\t\t);
\t\t\tproductName = ScreenmacTests;
\t\t\tproductReference = {I['testProduct']} /* ScreenmacTests.xctest */;
\t\t\tproductType = "com.apple.product-type.bundle.unit-test";
\t\t}};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
\t\t{I['project']} /* Project object */ = {{
\t\t\tisa = PBXProject;
\t\t\tattributes = {{
\t\t\t\tBuildIndependentTargetsInParallel = 1;
\t\t\t\tLastSwiftUpdateCheck = 1600;
\t\t\t\tLastUpgradeCheck = 1600;
\t\t\t\tTargetAttributes = {{
\t\t\t\t\t{I['appTarget']} = {{
\t\t\t\t\t\tCreatedOnToolsVersion = 16.0;
\t\t\t\t\t}};
\t\t\t\t\t{I['testTarget']} = {{
\t\t\t\t\t\tCreatedOnToolsVersion = 16.0;
\t\t\t\t\t\tTestTargetID = {I['appTarget']};
\t\t\t\t\t}};
\t\t\t\t}};
\t\t\t}};
\t\t\tbuildConfigurationList = {I['projList']} /* Build configuration list for PBXProject "Screenmac" */;
\t\t\tdevelopmentRegion = en;
\t\t\thasScannedForEncodings = 0;
\t\t\tknownRegions = (
\t\t\t\ten,
\t\t\t\tBase,
\t\t\t);
\t\t\tmainGroup = {I['mainGroup']};
\t\t\tminimizedProjectReferenceProxies = 1;
\t\t\tpreferredProjectObjectVersion = 77;
\t\t\tproductRefGroup = {I['productsGroup']} /* Products */;
\t\t\tprojectDirPath = "";
\t\t\tprojectRoot = "";
\t\t\ttargets = (
\t\t\t\t{I['appTarget']} /* Screenmac */,
\t\t\t\t{I['testTarget']} /* ScreenmacTests */,
\t\t\t);
\t\t}};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
{phase(I['appResources'], 'PBXResourcesBuildPhase', 'Resources')}
{phase(I['testResources'], 'PBXResourcesBuildPhase', 'Resources')}
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
{phase(I['appSources'], 'PBXSourcesBuildPhase', 'Sources')}
{phase(I['testSources'], 'PBXSourcesBuildPhase', 'Sources')}
/* End PBXSourcesBuildPhase section */

/* Begin PBXTargetDependency section */
\t\t{I['dependency']} /* PBXTargetDependency */ = {{
\t\t\tisa = PBXTargetDependency;
\t\t\ttarget = {I['appTarget']} /* Screenmac */;
\t\t\ttargetProxy = {I['proxy']} /* PBXContainerItemProxy */;
\t\t}};
/* End PBXTargetDependency section */

/* Begin XCBuildConfiguration section */
{config(I['projDebug'], 'Debug', DEBUG)}
{config(I['projRelease'], 'Release', RELEASE)}
{config(I['appDebug'], 'Debug', APP)}
{config(I['appRelease'], 'Release', APP)}
{config(I['testDebug'], 'Debug', TEST)}
{config(I['testRelease'], 'Release', TEST)}
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
{config_list(I['projList'], 'PBXProject "Screenmac"', I['projDebug'], I['projRelease'])}
{config_list(I['appList'], 'PBXNativeTarget "Screenmac"', I['appDebug'], I['appRelease'])}
{config_list(I['testList'], 'PBXNativeTarget "ScreenmacTests"', I['testDebug'], I['testRelease'])}
/* End XCConfigurationList section */
\t}};
\trootObject = {I['project']} /* Project object */;
}}
"""

scheme = f"""<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "1600" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{I['appTarget']}" BuildableName = "Screenmac.app" BlueprintName = "Screenmac" ReferencedContainer = "container:Screenmac.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES" shouldAutocreateTestPlan = "YES">
      <Testables>
         <TestableReference skipped = "NO" parallelizable = "YES">
            <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{I['testTarget']}" BuildableName = "ScreenmacTests.xctest" BlueprintName = "ScreenmacTests" ReferencedContainer = "container:Screenmac.xcodeproj">
            </BuildableReference>
         </TestableReference>
      </Testables>
   </TestAction>
   <LaunchAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{I['appTarget']}" BuildableName = "Screenmac.app" BlueprintName = "Screenmac" ReferencedContainer = "container:Screenmac.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction buildConfiguration = "Release" shouldUseLaunchSchemeArgsEnv = "YES" savedToolIdentifier = "" useCustomWorkingDirectory = "NO" debugDocumentVersioning = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference BuildableIdentifier = "primary" BlueprintIdentifier = "{I['appTarget']}" BuildableName = "Screenmac.app" BlueprintName = "Screenmac" ReferencedContainer = "container:Screenmac.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction buildConfiguration = "Debug">
   </AnalyzeAction>
   <ArchiveAction buildConfiguration = "Release" revealArchiveInOrganizer = "YES">
   </ArchiveAction>
</Scheme>
"""

(PROJ / "xcshareddata" / "xcschemes").mkdir(parents=True, exist_ok=True)
(PROJ / "project.pbxproj").write_text(pbx)
(PROJ / "xcshareddata" / "xcschemes" / "Screenmac.xcscheme").write_text(scheme)
print(f"Wrote {PROJ}")
