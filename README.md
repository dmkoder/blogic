<img align="right" width="150" alt="logo" src="assets/img/logo.png">

<h1 style="border-bottom:none;">bLogic.ink</h1>

This is the source repository for the [bLogic.ink](https://bLogic.ink) web blog.

This blog is built using [Hugo](https://gohugo.io/), and the theme [Hugo theme Stack](https://github.com/CaiJimmy/hugo-theme-stack).

## Get started

To run this web blog on your local machine. **You need to install Git, Go and Hugo extended locally.**
Clone the project, and in the root simply run `hugo serve`.

## Deploy

Simply push to the `main` branch.  

## Update theme manually

Run:

```bash
hugo mod get -u github.com/CaiJimmy/hugo-theme-stack/v3
hugo mod tidy
```

> This starter template has been configured with `v3` version of theme. Due to the limitation of Go module, once the `v4` or up version of theme is released, you need to update the theme manually. (Modifying `config/module.toml` file)
