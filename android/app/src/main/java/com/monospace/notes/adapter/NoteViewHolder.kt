package com.monospace.notes.adapter

import android.view.View
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.monospace.notes.model.Note
import com.monospace.notes.R

class NoteViewHolder(view: View) : RecyclerView.ViewHolder(view) {

    private val titleText = view.findViewById<TextView>(R.id.title)
    private val noteText = view.findViewById<TextView>(R.id.note)

    fun render(note: Note, onClickListener: (Note) -> Unit) {
        titleText.text = note.title
        noteText.text = note.note

        itemView.setOnClickListener {
            onClickListener(note)
        }
    }
}