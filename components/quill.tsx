'use client'
import React, {useEffect, useState} from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), {ssr: false});

interface QuillProps {
    className?: string;
    onChangeValue: (value: string) => void;
    title?: string;
    value?: string;
    placeholder?: string;
}

const QuillComponent: React.FC<QuillProps> = ({className, onChangeValue, title, value: defaultValue, placeholder}: QuillProps) => {
    const [value, setValue] = useState(defaultValue || '');

    useEffect(() => {
        if (defaultValue !== undefined) {
            setValue(defaultValue);
        }
    }, [defaultValue]);

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onChangeValue(newValue);
    };

    return (
        <div className={className}>
            {title && <h3>{title}</h3>}
            <ReactQuill
                placeholder={placeholder || "Nhập vào nội dung..."}
                modules={{
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video', 'formula'],

                        [{ 'header': 1 }, { 'header': 2 }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],

                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        [{ 'align': [] }],
                        
                        ['table'],
                        ['emoji'],
                        ['mention'],
                        ['hashtag'],
                        ['highlight'],
                        ['clean']
                    ],
                    clipboard: {
                        matchVisual: false,
                        allowRender: true
                    },
                    history: {
                        delay: 1000,
                        maxStack: 1000,
                        restoreStack: true
                    }
                }}

                formats={[
                    'header', 'font', 'size',
                    'bold', 'italic', 'underline', 'strike', 'blockquote',
                    'list', 'bullet', 'indent',
                    'link', 'image', 'video',
                    'align', 'direction', 'code-block',
                    'formula', 'script',
                    'color', 'background',
                    'table', 'emoji', 'mention', 'hashtag', 'highlight'
                ]}

                theme="snow" value={value} onChange={handleChange}/>
        </div>
    );
};

export default QuillComponent;