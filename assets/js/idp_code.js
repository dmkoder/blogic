hljs.registerLanguage('idp', function() {
    return {
        case_insensitive: true, // language is case-insensitive
        keywords: 'LTCvocabulary vocabulary theory structure factlist procedure include pretty_print printmodels print tonumber io\. read',
        contains: [
        {
            className: 'string',
            begin: '"',
            end: '"'
        },
        hljs.COMMENT(
            '/\\*', // begin
            '\\*/', // end
            {
            contains: [{
                className: 'doc',
                begin: '@\\w+'
            }]
            }
        ),
        {
            className: 'comment',
            begin: '//', end: '$'
        },
        {
            className: 'bracket',
            begin: /[\(\)\{\}\[\]:]/
        },
        {
            className: 'vockeyword',
            begin: /\b(type|partial|isa|while|true|do|if|nil|then|else|elseif|local|end|break|extern)\b/
        }
        ]
    }
});

async function fetchCode(type, userId, repoId, filePath, fileName) {
    try {
        var url = ""
        if (type === "gist") {
            url = `https://gist.githubusercontent.com/${userId}/${repoId}/raw/${filePath}/${fileName}`;
        } else {
            url = `https://raw.githubusercontent.com/${userId}/${repoId}/refs/heads/main/${filePath}/${fileName}`;
        }

        const response = await fetch(url, { cache: "no-store" });
        const code = await response.text();

        // Use the filename (with spaces replaced by underscores) as the element ID
        const codeBlock = document.getElementById(fileName.replace(/ /g, "_"));
        if (!codeBlock) throw new Error(`Code block with id '${fileName}' not found`);

        codeBlock.textContent = code;
        hljs.highlightElement(codeBlock);
    } catch (err) {
        console.error("Error fetching or highlighting code:", err);
    }   
}
