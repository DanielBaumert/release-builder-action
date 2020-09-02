import {
    existsSync,
    lstatSync,
    readdirSync,
    statSync,
    createWriteStream,
    readFileSync,
} from 'fs';
import { join } from 'path';
import archiver from 'archiver';

import { getInput, setFailed } from '@actions/core';
import { getOctokit, context } from '@actions/github';

const octokit = getOctokit(process.env.GITHUB_TOKEN);

(async () => {
    const dir = getInput('dir', { required: true });
    const releaseId = getInput('release_id', { required: true });
    const uploadUrl = getInput('upload_url', { required: true });

    console.log('Input:');
    console.log(`    dir: ${dir}`);
    console.log(`    release_id: ${releaseId}`);
    console.log(`    upload_url: ${uploadUrl}`);

    const root = join(process.env.GITHUB_WORKSPACE, dir);
    if (!existsSync(root)) {
        return setFailed(`${root} - Not found!`);
    }

    if (!lstatSync(root).isDirectory()) {
        return setFailed(`${root} - Is not a directory!`);
    }

    const bodyContent = [];
    for (const f of readdirSync(root)) {

        const fPath = join(root, f);

        if (!statSync(fPath).isDirectory()) {
            console.warn(`${fPath} is not a directory and will be skipped!`);
            continue;
        }

        const fZipName = `${f}.zip`;
        const fZipPath = `${fPath}.zip`;

        try {
            const zipArchive = archiver('zip');
            zipArchive.pipe(createWriteStream(fZipPath));
            await zipArchive.directory(fPath, false)
                            .finalize();

            const uploadAsset = await octokit.repos.uploadReleaseAsset({
                url: uploadUrl,
                headers: {
                    'content-type': 'application/zip',
                    'content-length': statSync(fZipPath).size,
                },
                name: fZipName,
                file: readFileSync(fZipPath),
            });

            bodyContent.push(`\n- [${fZipName}](${uploadAsset.browser_download_url})`);
        }
        catch (err) {
            return setFailed(err.message);
        }
    }

    const { owner, repo } = context.repo;

    await octokit.repos.updateRelease({
        owner,
        repo,
        release_id: releaseId,
        body: `## Templates${bodyContent.join('')}`,
    });
})();
