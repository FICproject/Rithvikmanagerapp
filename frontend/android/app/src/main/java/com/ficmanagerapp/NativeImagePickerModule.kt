package com.ficmanagerapp

import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.provider.MediaStore
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File
import java.io.FileOutputStream

class NativeImagePickerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val NAME = "NativeImagePicker"
        private const val REQUEST_CAMERA = 1001
        private const val REQUEST_GALLERY = 1002
    }

    private var pendingPromise: Promise? = null
    private var currentPhotoPath: String? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = NAME

    @ReactMethod
    fun launchCamera(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Activity doesn't exist")
            return
        }

        try {
            pendingPromise = promise
            val photoFile = File.createTempFile("FIC_CAMERA_", ".jpg", reactApplicationContext.cacheDir)
            currentPhotoPath = photoFile.absolutePath

            val photoUri: Uri = FileProvider.getUriForFile(
                reactApplicationContext,
                "${reactApplicationContext.packageName}.fileprovider",
                photoFile
            )

            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, photoUri)
                clipData = ClipData.newRawUri("photo", photoUri)
                addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            activity.startActivityForResult(intent, REQUEST_CAMERA)
        } catch (e: Exception) {
            pendingPromise = null
            currentPhotoPath = null
            promise.reject("CAMERA_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun launchGallery(promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Activity doesn't exist")
            return
        }

        try {
            pendingPromise = promise
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI).apply {
                type = "image/*"
            }
            if (intent.resolveActivity(activity.packageManager) == null) {
                val fallbackIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "image/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                activity.startActivityForResult(Intent.createChooser(fallbackIntent, "Select Image"), REQUEST_GALLERY)
            } else {
                activity.startActivityForResult(intent, REQUEST_GALLERY)
            }
        } catch (e: Exception) {
            pendingPromise = null
            promise.reject("GALLERY_ERROR", e.message, e)
        }
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        val promise = pendingPromise ?: return

        if (resultCode != Activity.RESULT_OK) {
            pendingPromise = null
            currentPhotoPath = null
            promise.resolve(null)
            return
        }

        try {
            when (requestCode) {
                REQUEST_CAMERA -> {
                    val path = currentPhotoPath
                    if (path != null && File(path).exists() && File(path).length() > 0) {
                        val result = Arguments.createMap().apply {
                            putString("uri", "file://$path")
                            putString("fileName", File(path).name)
                            putBoolean("didCancel", false)
                        }
                        pendingPromise = null
                        currentPhotoPath = null
                        promise.resolve(result)
                    } else if (data?.data != null) {
                        val destFile = File.createTempFile("FIC_CAMERA_", ".jpg", reactApplicationContext.cacheDir)
                        reactApplicationContext.contentResolver.openInputStream(data.data!!)?.use { input ->
                            destFile.outputStream().use { output ->
                                input.copyTo(output)
                            }
                        }
                        val result = Arguments.createMap().apply {
                            putString("uri", "file://${destFile.absolutePath}")
                            putString("fileName", destFile.name)
                            putBoolean("didCancel", false)
                        }
                        pendingPromise = null
                        currentPhotoPath = null
                        promise.resolve(result)
                    } else if (data?.extras?.get("data") != null) {
                        val bitmap = data.extras?.get("data") as Bitmap
                        val destFile = File.createTempFile("FIC_CAMERA_", ".jpg", reactApplicationContext.cacheDir)
                        FileOutputStream(destFile).use { out ->
                            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, out)
                        }
                        val result = Arguments.createMap().apply {
                            putString("uri", "file://${destFile.absolutePath}")
                            putString("fileName", destFile.name)
                            putBoolean("didCancel", false)
                        }
                        pendingPromise = null
                        currentPhotoPath = null
                        promise.resolve(result)
                    } else {
                        pendingPromise = null
                        currentPhotoPath = null
                        promise.resolve(null)
                    }
                }
                REQUEST_GALLERY -> {
                    val selectedImageUri = data?.data
                    if (selectedImageUri != null) {
                        val destFile = File.createTempFile("FIC_GALLERY_", ".jpg", reactApplicationContext.cacheDir)
                        reactApplicationContext.contentResolver.openInputStream(selectedImageUri)?.use { input ->
                            destFile.outputStream().use { output ->
                                input.copyTo(output)
                            }
                        }

                        val result = Arguments.createMap().apply {
                            putString("uri", "file://${destFile.absolutePath}")
                            putString("fileName", destFile.name)
                            putBoolean("didCancel", false)
                        }
                        pendingPromise = null
                        promise.resolve(result)
                    } else {
                        pendingPromise = null
                        promise.resolve(null)
                    }
                }
                else -> {
                    pendingPromise = null
                }
            }
        } catch (e: Exception) {
            pendingPromise = null
            currentPhotoPath = null
            promise.reject("PROCESS_ERROR", e.message, e)
        }
    }

    override fun onNewIntent(intent: Intent?) {}
}
