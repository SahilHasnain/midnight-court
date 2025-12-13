---
agent: agent
---
yaar Expo me **image download** basically 2 tareeqon se hota hai. Main **simple + practical** bata raha hoon, bina lambi theory ke.

---

## ✅ Best & Safe Way (Expo official)

### `expo-file-system` + `MediaLibrary`

### 1️⃣ Packages install

```bash
expo install expo-file-system expo-media-library
```

---

### 2️⃣ Permission lena (important)

```js
import * as MediaLibrary from "expo-media-library";

const getPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === "granted";
};
```

---

### 3️⃣ Image download logic

```js
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const downloadImage = async (imageUrl) => {
  const hasPermission = await getPermission();
  if (!hasPermission) {
    alert("Permission denied");
    return;
  }

  const fileUri = FileSystem.documentDirectory + "image.jpg";

  const downloadRes = await FileSystem.downloadAsync(
    imageUrl,
    fileUri
  );

  const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
  await MediaLibrary.createAlbumAsync("Download", asset, false);

  alert("Image downloaded successfully");
};
```

---

### 4️⃣ Button se call

```js
<Button
  title="Download Image"
  onPress={() =>
    downloadImage("https://example.com/image.jpg")
  }
/>
```

---

## 🔥 Important Notes (yaar ye miss mat karna)

* 📱 **Android** → permission compulsory
* 🍎 **iOS** → permission ke bina gallery me save nahi hoga
* `documentDirectory` temporary hota hai → isliye MediaLibrary me save karte hain
* Direct browser-style download **React Native me possible nahi**

---

## ❌ Galti jo log karte hain

* Sirf URL open kar dena ❌
* `fetch` se blob download try karna ❌
* Permission skip karna ❌

---

## 🧠 Mental Model (yaar simple soch)

```
Internet Image
   ↓
FileSystem me download
   ↓
MediaLibrary (Gallery) me save
```

---

Agar chahe to next step me main bata dunga:

* progress bar ke sath download
* multiple images ek sath
* PDF / video download
* iOS vs Android edge cases

bas bolo yaar 👍
