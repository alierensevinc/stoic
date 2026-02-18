import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> QuoteEntryWrapper {
        QuoteEntryWrapper(date: Date(), quote: QuoteEntry(text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus"))
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntryWrapper) -> ()) {
        let entry = QuoteEntryWrapper(date: Date(), quote: randomQuote(for: context.family))
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntryWrapper>) -> ()) {
        var entries: [QuoteEntryWrapper] = []

        // Generate a timeline with 5 entries, one every hour
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = QuoteEntryWrapper(date: entryDate, quote: randomQuote(for: context.family))
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    private func randomQuote(for family: WidgetFamily) -> QuoteEntry {
        let source = (family == .accessoryRectangular) ? QuotesData.short : QuotesData.all
        
        if let quote = source.randomElement() {
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
    @Environment(\.widgetFamily) var family
    
    var themeColors: Theme.Colors {
        return colorScheme == .dark ? Theme.dark : Theme.light
    }

    var body: some View {
        Group {
            if family == .accessoryRectangular {
                ZStack {
                    ContainerRelativeShape()
                        .fill(Color.clear) // Transparent background for lock screen
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.quote.text)
                            .font(.system(size: 14, weight: .medium, design: .serif))
                            .multilineTextAlignment(.leading)
                            .minimumScaleFactor(0.8)
                            .lineLimit(2)
                        
                        Text("- \(entry.quote.author)")
                            .font(.system(size: 10, weight: .regular, design: .default))
                            .opacity(0.8)
                    }
                }
            } else {
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
    }
}

struct QuoteWidget: Widget {
    let kind: String = "QuoteWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                QuoteWidgetEntryView(entry: entry)
                    .containerBackground(for: .widget) {
                        if (entry.quote.text.count < 60) {
                             // This is just a check, but we need to check family actually.
                             // But inside containerBackground closure we don't have easy access to environment family 
                             // unless we capture it or check entry? No entry doesn't have family.
                             // Actually, containerBackground is not needed for lock screen widgets in the same way,
                             // or rather it handles it differently. 
                             // For simplicity and to match the style:
                             // .fill.tertiary or similar is common for lock screen, but we want clear/custom.
                             // Actually user wants "sade" (simple). Transparency is default for lock screen.
                             // Let's just return the theme background for regular widgets.
                             Theme.light.background // Fallback/default?
                             // Wait, we need to return the correct background for HOME screen.
                        }
                       QuoteWidgetEntryView(entry: entry).themeColors.background
                    }
            } else {
                QuoteWidgetEntryView(entry: entry)
                    .background(QuoteWidgetEntryView(entry: entry).themeColors.background)
            }
        }
        .configurationDisplayName("Stoic Quotes")
        .description("Daily stoic wisdom for your Home & Lock Screen.")
        .supportedFamilies([.systemMedium, .systemLarge, .accessoryRectangular])
        .contentMarginsDisabled() 
    }
}
