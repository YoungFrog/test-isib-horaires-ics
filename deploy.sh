#!/usr/bin/bash

die() {
    warn "$@"
    exit 1
}
warn() {
    printf >&2 "%s\n" "$*"
}

say() {
    printf "%s\n" "$*"
}

shopt -s extglob || die "Could not activate extglob"
removed_files=(!(.git|.gitignore|.nojekyll|CNAME|config|deploy.sh|ical|work))
shopt -u extglob

## Files that will be copied over from the "work" directory
dist_files=(css index.html dist img LICENSE)

upstream_branch="${1:-upstream/master}"

if ! [[ -d ical ]]; then
    die "ical dir not found"
fi

if ! [[ -f config/calendars.json ]]; then
    die "config/calendars.json not found"
fi

if ! type -p yarn; then
    die "yarn was not found."
fi

if [[ -d work ]]; then
    git worktree remove -f work || die "Could not remove work/ dir"
fi

git worktree add work "$upstream_branch" || die "Could not checkout upstream code"

git merge --no-commit -s ours "$upstream_branch"

rm -r "${removed_files[@]}"

cd work || die "Sum Ting Wong, can't cd to: work"

yarn
yarn build
cp -rt .. "${dist_files[@]}"

cd .. || die ""

git add .
git commit -m "Update website"

say "Can now push after making sure it's all good. You can e.g. php -S localhost:3547"
