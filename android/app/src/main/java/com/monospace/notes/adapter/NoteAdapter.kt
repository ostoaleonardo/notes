package com.monospace.notes.adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.monospace.notes.model.Note
import com.monospace.notes.R

class NoteAdapter(
    private val noteList: List<Note>,
    private val onClickListener: (Note) -> Unit
) :
    RecyclerView.Adapter<NoteViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NoteViewHolder {
        val layoutInflater = LayoutInflater.from(parent.context)
        val view = layoutInflater.inflate(R.layout.note_widget_configure_item, parent, false)
        return NoteViewHolder(view)
    }

    override fun getItemCount(): Int {
        return noteList.size
    }

    override fun onBindViewHolder(holder: NoteViewHolder, position: Int) {
        val item = noteList[position]
        holder.render(item, onClickListener)
    }
}