const { opendir, writeFile, mkdir, unlink } = require("fs/promises");
const { extname, dirname, join, basename } = require("path");
const { compileFile } = require("pug")

async function clean(path = "./static")
{
    const dir = await opendir(path);

    for await (const dirent of dir) {
        const currentPath = join(dir.path, dirent.name)
        
        if (dirent.isDirectory()) {
            await clean(currentPath)
        }
        else if (dirent.isFile() && extname(currentPath) === ".html") {
            // console.log("DELETE", currentPath)
            await unlink(currentPath)
        }
    }
}

/**
 * @param {string} path 
 */
async function handleFile(path)
{
    if (extname(path) === ".pug" && basename(path) !== "layout.pug") {
        return handleTemplateFile(path)
    }
}

/**
 * @param {string} path 
 */
async function handleTemplateFile(path)
{
    const dest = path.replace(/^templates\//, "static/").replace(/\.pug$/, ".html");
    // console.log("-------------------------------------------")
    // console.log(path, "->", dest)
    // console.log("-------------------------------------------")
    const fn = compileFile(path, { pretty: true })
    const html = fn()
    // console.log(html)
    mkdir(dirname(dest), { recursive: true })
        .then(() => writeFile(dest, html, "utf8"))
        .then(() => console.log("Built ", dest))
        .catch(console.error)
}

/**
 * @param {string} path 
 */
async function handleDirectory(path)
{
    // console.log(path)

    const dir = await opendir(path);

    for await (const dirent of dir) {
        if (dirent.isDirectory()) {
            await handleDirectory(join(dir.path, dirent.name))
        }
        else if (dirent.isFile()) {
            await handleFile(join(dir.path, dirent.name))
        }
    }
}

async function main()
{
    await clean();
    await handleDirectory("./templates");
}

main()
