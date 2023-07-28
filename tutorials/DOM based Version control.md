### Introduction

In this application (Facsimile Explorer) the data is versioned in GitHub. The Octokit library is used for this purpose. This means that the complete data repository does not have to be loaded into the browser's memory, but all actions are performed remotely directly at GitHub. The fact that there is no local repository, as is common with a distributed versioning tool like Git, does not make distributed work impossible, but there are some cases to be aware of when working in parallel.
In Facsimile Explorer (FX), only XML data is processed, namely MEI and SVG. All important elements are marked with unique UUIDs (attribute `id` or `xml:id`). Since Git is line-based, all files are formatted before being saved to GitHub, so that each XML node appears on its own line.
Each XML document is stored in the Vue store by its path.

#### The problem

Now, if two users are working with FX at the same time, user A may have something committed, but user B may not have the local XML instances updated. If user B commits now, this is merged with the state at GitHub, if there are no serious collisions. That's no problem at all for now. If now user A commits something again, it is again merged with the newly created state on GitHub. Another commit by user A would go through without a problem, but if user B now commits something again, data may be lost. The commit sequence would then be `A-B-A-B`. It may now be that on one side the local documents do not contain all removed changes and thus as a change with the next Commit again are taken back.

#### The solution

To avoid this problem, the current version of the affected file is loaded from GitHub before each commit. All affected XML elements are replaced in the loaded document by ID with the local versions before the document is committed again.

