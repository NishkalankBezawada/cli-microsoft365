# aad user license remove

Removes a license from a user

## Usage

```sh
m365 aad user license remove [options]
```

## Options

`--userId [userId]`
: The ID of the user. Specify either `userId` or `userName` but not both.

`--userName [userName]`
: 	User principal name of the user. Specify either `userId` or `userName` but not both.

`--ids <ids>`
: A comma separated list of IDs that specify the licenses to remove.

`--confirm`
: Don't prompt for confirmation.

--8<-- "docs/cmd/_global.md"

## Examples

Remove specific licenses from a specific user by UPN

```sh
m365 user license remove --userName "john.doe@contoso.com" --ids "45715bb8-13f9-4bf6-927f-ef96c102d394,bea13e0c-3828-4daa-a392-28af7ff61a0f"
```

Remove specific licenses from a specific user by ID

```sh
m365 user license remove --userId 5c241023-2ba5-4ea8-a516-a2481a3e6c51 --ids "45715bb8-13f9-4bf6-927f-ef96c102d394,bea13e0c-3828-4daa-a392-28af7ff61a0f"
```

## Response

The command won't return a response on success.