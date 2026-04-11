# Dart Setup Action

Install the Dart SDK on macOS or Linux.

## Usage

```yaml
- uses: open-ci-io/dart-setup@v1
  with:
    dart-version: "stable" # optional, defaults to "stable"
```

## Inputs

| Input          | Description                                        | Default    |
| -------------- | -------------------------------------------------- | ---------- |
| `dart-version` | Dart release channel (`stable`, `beta`) or version  | `stable`   |

## Supported Platforms

| Platform | Method                   |
| -------- | ------------------------ |
| macOS    | Homebrew (`brew install dart`) |
| Linux    | apt-get (official Dart repo)   |

## Development

```bash
npm install
npm run build
```
