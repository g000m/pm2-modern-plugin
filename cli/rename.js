#!/usr/bin/env node
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
const shell = require('shelljs');
const mdSedFactory = require( './lib/mdSedFactory');
const phpSedFactory = require( './lib/phpSedFactory');
/**
 * Rewrite plugin name, slug, function prefix and namespace in php files
 */
function changeNameInPhpFiles({slug,rootNamespace,pluginName,originalNamespace, originalPluginName}){
    let sed = phpSedFactory({slug,rootNamespace})
    shell.mv( 'pm2-modern-plugin.php', `${slug}.php` ); // HERE
    sed(`${slug}.php`);
    shell.sed('-i', 'PluginNamespace', pluginName, `${slug}.php`); // HERE
    shell.sed('-i', 'PLUGIN_NAME', pluginName, `${slug}.php`); // HERE
    shell.sed('-i', 'VendorNamespace', originalNamespace, `${slug}.php`); // HERE
    shell.ls('**/*.php').forEach(sed);
}

function changeNameInMdFiles({pluginName,slug,githubUserName}){
    const mdSed = mdSedFactory({pluginName,slug,githubUserName})
    shell.mv( 'cli/templates/_README.md', 'README.md' );
    mdSed('README.md');
    shell.rm( 'docs/index.md');
    shell.ls('docs/*.md').forEach(mdSed);
    shell.cp( 'README.md', 'docs/index.md');
}


readline.question(`What is your plugin's slug? Used for translation domain, main file name, etc. `, slug => {
    slug = slug.replace(/\W/g, '').toLowerCase();
    readline.question(`Root Namespace `, rootNamespace => {
        readline.question(`Plugin name? `, pluginName => {
            readline.question(`Github username? `, githubUserName => {
                let originalNamespace = 'VendorNamespace'; // HERE
                const originalPluginName = 'PLUGIN_NAME'; // HERE
                changeNameInPhpFiles({slug,rootNamespace,pluginName,originalNamespace, originalPluginName});
                // changeNameInMdFiles({pluginName,slug,githubUserName});
                //Replace slug in pages/admin entry point
                shell.sed('-i', "wordpress-plugin", slug,  `pages/admin/index.js`); // HERE
                //Replace name in package.json
                shell.sed('-i', "pm2-modern-plugin", `${slug}`,  'package.json'); // HERE

                //replace namespace in composer.json
                shell.sed('-i', originalNamespace, rootNamespace, 'composer.json');
                shell.sed('-i', originalPluginName, pluginName, 'composer.json');
                readline.close()
            });
        });
    });
});
