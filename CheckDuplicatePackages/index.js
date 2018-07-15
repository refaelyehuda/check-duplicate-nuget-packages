const { lstatSync, readdirSync } = require('fs');
const path = require('path');
const tl = require('vso-task-lib');
const _ = require("underscore");

//getting the endpoint details securely 
var sourcePath = tl.getInput('Path', true);
var patternToExtractPackageName = tl.getInput('patternToExtractPackageName', true);

/**
 * get all directories under path
 * @param {string} sourcePath
 */
const getPackages = sourcePath => readdirSync(sourcePath).map(name => name.replace(new RegExp(patternToExtractPackageName,'g'),""));
const getPackagesWithVersions = sourcePath => readdirSync(sourcePath).map(name => name);
/**
 * return true if the package appear twice or more
 * @param {Array} package
 * @returns {Boolean}
 */
const IsDuplicatePackage = package => {
    if(package.length < 2)
        return false;
    return true;
};
//application input
console.log('Getting packages list...');
var packagesList = getPackages(sourcePath);
//get all duplicate packages if exist
console.log('Counting packages...');
var duplicatePackages = _.chain(packagesList).groupBy().filter(IsDuplicatePackage);
console.log('Checking if there are duplicate packages...');
if(duplicatePackages !== undefined && duplicatePackages._wrapped.length > 0){
    tl.error('Duplicates found');
    var packagesWithVersions = getPackagesWithVersions(sourcePath);
    duplicatePackages.forEach((package) => {
        //get the package name that found
        var packageName = package.pop();
        tl.error(packageName + " duplicate versions are: ");
        //get packages with their versions
        var packageVersions = packagesWithVersions.filter( package => package.indexOf(packageName) > -1);
        packageVersions.forEach(function(packageVersion){
            packageVersionName = packageVersion.replace(new RegExp(patternToExtractPackageName,'g'),"");
            //validate that package name is not substing of another package
            if(packageVersionName == packageName){
                tl.error("\t " + packageVersion);
            }
        });
    });
    tl.setResult(tl.TaskResult.Failed);
}else{
    console.log("There are no duplicates");
}


