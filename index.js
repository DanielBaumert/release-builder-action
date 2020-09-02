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

///
/// Code
///
(async () => {
    const dir = getInput('dir', { required: true });
    const releaseId = getInput('release_id', { required: true });
    const uploadUrl = getInput('upload_url', { required: true });

    console.log('Input:');
    console.log(`    dir: ${dir}`);
    console.log(`    release_id: ${releaseId}`);
    console.log(`    upload_url: ${uploadUrl}`);

    console.log('Programm:');
    const root = join(process.env.GITHUB_WORKSPACE, dir);
    if (!existsSync(root)) {
        return setFailed(`${root} - Not found!`);
    }

    const fsStats = lstatSync(root);
    if (!fsStats.isDirectory()) {
        return setFailed(`${root} - Is not a directory!`);
    }

    const archives = [];
    for (const f of readdirSync(root)) {

        console.log(f);
        f = path.join(root, f);
        
        if (!statSync(f).isDirectory()) {
            console.warn(`${f} is not a directory!`);
            continue;
        }

        const fZipName = `${f}.zip`;
        const fPath = join(root, f);
        const fZip = `${fPath}.zip`;

        try {
            const output = createWriteStream(fZip);

            const zipArchive = archiver('zip');
            zipArchive.pipe(output);
            zipArchive.directory(fPath, false);
            zipArchive.finalize();

            const headers = {
                'content-type': 'application/zip',
                'content-length': statSync(fZip).size,
            };

            const uploadAsset = await octokit.repos.uploadReleaseAsset({
                url: uploadUrl,
                headers,
                name: fZipName,
                file: readFileSync(fZip),
            });

            archives.push({ fZipName, uploadUrl: uploadAsset.url });
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
        body: `## Templates${archives.map(a => `\n- [${a.fZipName}](${a.uploadUrl})`)}`,
    });
})();
