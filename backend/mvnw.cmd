@REM Maven Wrapper startup script for Windows

@REM Find project base directory
set "MAVEN_PROJECTBASEDIR=%~dp0"
set "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
set "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties"

@REM Check if maven-wrapper.jar exists, if not download it
if not exist "%WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
    powershell -Command "& {$wrapperUrl = Get-Content '%WRAPPER_PROPERTIES%' | Select-String 'wrapperUrl' | ForEach-Object {($_ -split '=')[1]}; Invoke-WebRequest -Uri $wrapperUrl -OutFile '%WRAPPER_JAR%'}"
)

@REM Execute Maven
java %MAVEN_OPTS% -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
