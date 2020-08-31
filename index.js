import {
    existsSync,
    lstatSync,
    readdirSync,
    statSync,
    accessSync,
    constants,
    openSync,
    closeSync,
    createWriteStream,
    readFileSync,
} from 'fs';
import { join, basename } from 'path';
import archiver from 'archiver';

import { getInput } from '@actions/core';
import { getOctokit, context } from '@actions/github';

const octokit = getOctokit(process.env.GITHUB_TOKEN);

///
/// Code
///
(async () => {
    console.log('== Run ==');

    const dir = getInput('dir', { required: true });
    const root = join(process.env.GITHUB_WORKSPACE, dir);

    // const tagName = core.getInput('tag_name', { required: true }).replace('refs/heads/', '');
    // const releaseName = tagName;

    const uploadUrl = getInput('upload_url', { required: true });
    const releaseId = getInput('release_id', { required: true });

    console.log('Input: ');
    console.log(`    dir: ${dir}`);
    // console.log("    tag: " + tagName);
    // console.log("    releaseName: " + releaseName);
    // console.log("    htmlUrl: " + htmlUrl);
    // console.log("    releaseId: " + releaseId);

    console.log('Programm: ');

    // check dir input
    if (!existsSync(root)) {
        console.error(`    ${root} - Not Found`);
        return;
    }

    const fsStats = lstatSync(root);
    if (!fsStats.isDirectory()) {
        console.error(`    ${root} - Is not a directory`);
        return;
    }

    const normilizePath = (filePath) => join(root, filePath);

    console.log(`    rootDir: ${root}`);

    /* TODO check if dir */

    const fileObjects = readdirSync(root);

    console.log('    Current directory filenames:');

    const fullQualityPaths = fileObjects.map((f) => {
        const fPath = normilizePath(f);
        console.log(`        File: ${f} Path: ${fPath}`);
        return fPath;
    });

    console.log('    Run:');

    const fullQualityDir = fullQualityPaths.filter((f) => statSync(f).isDirectory());

    const fullQualityZip = fullQualityDir.map((f) => {
        console.log(`        Current directory for zip: ${f}`);

        const fZip = `${f}.zip`;
        try {
            accessSync(f, constants.F_OK);
        } catch (err) {
            console.error(`        Could not acces the ${f}`);
            return null;
        }

        try {
            accessSync(fZip, constants.F_OK | constants.W_OK);
        } catch (err) {
            if (err) {
                if (err.code === 'ENOENT') {
                    const fd = openSync(fZip, 'w');
                    closeSync(fd);
                } else {
                    console.error(`        Could not acces the ${fZip}`);
                    return null;
                }
            }
        }

        const output = createWriteStream(fZip);
        console.error(`        Create zip for ${f}`);
        const zipArchive = archiver('zip');
        zipArchive.pipe(output);
        zipArchive.directory(f, false);
        zipArchive.finalize();
        console.error(`        Created zip for ${f}`);

        return fZip;
    });

    let bodyContent = '## Templates';

    for (const f of fullQualityZip) {
        if (!f) {
            continue;
        }

        console.log(`        Current zip: ${f}`);
        const fileName = basename(f);
        const headers = {
            'content-type': 'application/zip',
            'content-length': statSync(f).size,
        };

        const uploadAsset = await octokit.repos.uploadReleaseAsset({
            url: uploadUrl,
            headers,
            name: fileName,
            file: readFileSync(f),
        });

        bodyContent += `\n- [${fileName}](${uploadAsset.url})`;
    }

    const { owner, repo } = context.repo;

    await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: releaseId,
        body: bodyContent,
    });
})();
