import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntryWrapper {
        QuoteEntryWrapper(date: Date(), quote: QuoteEntry(text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus"))
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntryWrapper) -> ()) {
        let entry = QuoteEntryWrapper(date: Date(), quote: randomQuote())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntryWrapper>) -> ()) {
        var entries: [QuoteEntryWrapper] = []

        // Generate a timeline with 5 entries, one every hour
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = QuoteEntryWrapper(date: entryDate, quote: randomQuote())
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    private func randomQuote() -> QuoteEntry {
        if let quote = QuotesData.all.randomElement() {
            return quote
        }
        return QuoteEntry(text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus")
    }
}

struct QuoteEntryWrapper: TimelineEntry {
    let date: Date
    let quote: QuoteEntry
}

struct QuoteWidgetEntryView : View {
    var entry: Provider.Entry
    @Environment(\.colorScheme) var colorScheme
    
    var themeColors: Theme.Colors {
        return colorScheme == .dark ? Theme.dark : Theme.light
    }

    var body: some View {
        ZStack {
            themeColors.background
                .ignoresSafeArea() 
            
            VStack(alignment: .leading, spacing: 10) {
                Text(entry.quote.text)
                    .font(.system(size: 16, weight: .medium, design: .serif))
                    .foregroundColor(themeColors.text)
                    .multilineTextAlignment(.leading)
                    .minimumScaleFactor(0.8) 
                
                Text("- \(entry.quote.author)")
                    .font(.system(size: 14, weight: .regular, design: .default))
                    .foregroundColor(themeColors.text.opacity(0.8))
            }
            .padding()
        }
    }
}

struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                QuoteWidgetEntryView(entry: entry)
                    .containerBackground(for: .widget) {
                        QuoteWidgetEntryView(entry: entry).themeColors.background
                    }
            } else {
                QuoteWidgetEntryView(entry: entry)
                    .background(QuoteWidgetEntryView(entry: entry).themeColors.background)
            }
        }
        .configurationDisplayName("Stoic Quotes")
        .description("Daily stoic wisdom on your home screen.")
        .supportedFamilies([.systemMedium, .systemLarge])
        .contentMarginsDisabled() 
    }
}
