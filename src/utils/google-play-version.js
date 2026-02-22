const fetchGooglePlayData = async (url) => {
    const response = await fetch(url)
        .then((response) => response.text())
        .catch(() => {
            throw new Error('Could not fetch data from Google Play')
        })

    return response
}

const matchVersion = (response) => {
    const matches = response.match(/\[\[\[['"]((\d+\.)+\d+)['"]\]\],/)

    if (!matches) {
        throw new Error('Could not find version')
    }

    return matches[1]
}

const compareVersions = (currentVersion, googlePlayVersion) => {
    const currentVersionArray = currentVersion.split('.')
    const googlePlayVersionArray = googlePlayVersion.split('.')

    for (let i = 0; i < currentVersionArray.length; i++) {
        if (parseInt(currentVersionArray[i]) < parseInt(googlePlayVersionArray[i])) {
            return true
        }
    }

    return false
}

export const getGooglePlayVersion = async (googlePlayUrl, currentVersion) => {
    const response = await fetchGooglePlayData(googlePlayUrl)
    const version = matchVersion(response)
    const updateAvailable = compareVersions(currentVersion, version)

    return {
        version,
        updateAvailable
    }
}
